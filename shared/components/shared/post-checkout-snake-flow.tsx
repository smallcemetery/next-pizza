'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '../ui';
import { useSession } from 'next-auth/react';

const WIN_APPLES = 50;
const TICK_SKIP = 14;

type Phase = 'closed' | 'invite' | 'playing' | 'lost' | 'won';

export const PostCheckoutSnakeFlow: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const orderIdParam = Number(searchParams.get('orderId'));
  const snakeFlag = searchParams.get('snake') === '1';
  const paid = searchParams.get('paid') === '1';

  const orderIdRef = React.useRef<number | null>(null);

  if (paid && snakeFlag && Number.isInteger(orderIdParam) && orderIdParam > 0) {
    orderIdRef.current = orderIdParam;
  }

  const [phase, setPhase] = React.useState<Phase>('closed');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const keyHandlerRef = React.useRef<((e: KeyboardEvent) => void) | null>(null);
  const applesRef = React.useRef(0);
  const [apples, setApples] = React.useState(0);
  const [gameKey, setGameKey] = React.useState(0);

  const clearQuery = React.useCallback(() => {
    router.replace('/', { scroll: false });
  }, [router]);

  React.useEffect(() => {
    if (!paid || !snakeFlag || !Number.isInteger(orderIdParam) || orderIdParam <= 0) {
      return;
    }
    setPhase('invite');
    if (status === 'unauthenticated') {
      return;
    }
    if (status !== 'authenticated') {
      return;
    }

    let cancelled = false;
    fetch(`/api/snake/eligibility?orderId=${orderIdParam}`)
      .then(async (r) => {
        const j = (await r.json()) as { canPlay?: boolean; message?: string };
        if (!r.ok) {
          throw new Error(j.message || 'Проверка недоступна');
        }
        return j;
      })
      .then((j) => {
        if (cancelled) return;
        if (j.canPlay === false) {
          toast('Бонусная игра за этот заказ уже недоступна');
          clearQuery();
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Не удалось проверить игру. Попробуйте обновить страницу.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paid, snakeFlag, orderIdParam, status, clearQuery]);

  React.useEffect(() => {
    if (phase === 'closed') {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  /** Стрелки не прокручивают страницу под оверлеем игры */
  React.useEffect(() => {
    if (phase === 'closed') {
      return;
    }
    const blockScrollKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockScrollKeys, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', blockScrollKeys, true);
  }, [phase]);

  React.useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (keyHandlerRef.current) {
        window.removeEventListener('keydown', keyHandlerRef.current, true);
      }
    };
  }, []);

  const claimBonus = React.useCallback(
    (appleCount: number) => {
      const oid = orderIdRef.current;
      if (!oid || !Number.isFinite(oid)) {
        toast.error('Не найден номер заказа. Откройте ссылку после оплаты ещё раз.');
        return;
      }
      fetch('/api/snake/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: oid, apples: appleCount }),
      })
        .then(async (r) => {
          const j = await r.json();
          if (!r.ok) throw new Error(j.message || 'Ошибка');
          return j;
        })
        .then((j) => {
          toast.success(`+${j.bonus} бонусов`);
          setPhase('closed');
          clearQuery();
        })
        .catch((e) => toast.error(e instanceof Error ? e.message : 'Ошибка'));
    },
    [clearQuery],
  );

  const stopGameLoop = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (keyHandlerRef.current) {
      window.removeEventListener('keydown', keyHandlerRef.current, true);
      keyHandlerRef.current = null;
    }
  }, []);

  const startPlaying = React.useCallback(() => {
    setGameKey((k) => k + 1);
    setPhase('playing');
  }, []);

  React.useEffect(() => {
    if (phase !== 'playing' || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const grid = 16;
    let count = 0;
    applesRef.current = 0;
    setApples(0);
    const maxSide = Math.floor(canvas.width / grid);
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

    let ended = false;

    const snake = {
      x: 160,
      y: 160,
      dx: grid,
      dy: 0,
      cells: [] as { x: number; y: number }[],
      maxCells: 4,
    };

    const apple = {
      x: getRandomInt(0, maxSide) * grid,
      y: getRandomInt(0, maxSide) * grid,
    };

    const bumpApples = (n: number) => {
      applesRef.current = n;
      setApples(n);
    };

    const onWin = () => {
      if (ended) return;
      ended = true;
      stopGameLoop();
      bumpApples(WIN_APPLES);
      setPhase('won');
    };

    const onLose = () => {
      if (ended) return;
      ended = true;
      stopGameLoop();
      setApples(applesRef.current);
      setPhase('lost');
    };

    const loop = () => {
      if (ended) return;
      rafRef.current = requestAnimationFrame(loop);
      if (++count < TICK_SKIP) return;
      count = 0;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const nx = snake.x + snake.dx;
      const ny = snake.y + snake.dy;
      if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) {
        onLose();
        return;
      }
      snake.x = nx;
      snake.y = ny;

      snake.cells.unshift({ x: snake.x, y: snake.y });
      if (snake.cells.length > snake.maxCells) snake.cells.pop();

      context.fillStyle = '#ef4444';
      context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

      context.fillStyle = '#22c55e';
      for (let index = 0; index < snake.cells.length; index++) {
        if (ended) break;
        const cell = snake.cells[index];
        context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        if (cell.x === apple.x && cell.y === apple.y) {
          snake.maxCells++;
          const next = Math.min(WIN_APPLES, applesRef.current + 1);
          bumpApples(next);
          apple.x = getRandomInt(0, maxSide) * grid;
          apple.y = getRandomInt(0, maxSide) * grid;
          if (next >= WIN_APPLES) {
            onWin();
          }
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
          if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
            onLose();
            break;
          }
        }
        if (ended) break;
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
      } else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
      } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
      } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
      }
    };

    keyHandlerRef.current = keyHandler;
    window.addEventListener('keydown', keyHandler, { capture: true, passive: false });
    rafRef.current = requestAnimationFrame(loop);
    canvas.focus();

    return () => {
      stopGameLoop();
    };
  }, [phase, stopGameLoop, gameKey]);

  if (phase === 'closed') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
      onWheel={(e) => e.preventDefault()}
      role="presentation">
      {phase === 'invite' && (
        <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-black">Бонусная змейка</h3>
          <p className="mt-3 text-sm text-neutral-600">
            Хотите сыграть и заработать до {WIN_APPLES} бонусов за заказ #{orderIdRef.current ?? orderIdParam}? Игра
            доступна один раз после оплаты.
          </p>
          {status !== 'authenticated' && (
            <p className="mt-2 text-xs text-amber-700">
              Чтобы забрать бонусы, войдите в аккаунт и повторите оформление.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" disabled={status !== 'authenticated'} onClick={startPlaying}>
              Давай попробуем
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPhase('closed');
                clearQuery();
              }}>
              В другой раз
            </Button>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="glass-card w-full max-w-lg rounded-3xl p-5 shadow-xl">
          <h3 className="text-lg font-black">Змейка</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Стрелки — движение (страница не прокручивается). Соберите {WIN_APPLES} яблок. Не врезайтесь в стены и в
            себя.
          </p>
          <div className="mt-4 rounded-xl bg-black p-3">
            <canvas
              key={gameKey}
              ref={canvasRef}
              width={400}
              height={400}
              tabIndex={0}
              className="mx-auto w-full max-w-[400px] border border-white outline-none"
            />
          </div>
          <p className="mt-3 text-sm font-semibold">
            Яблоки: {apples} / {WIN_APPLES}
          </p>
        </div>
      )}

      {phase === 'lost' && (
        <div className="glass-card w-full max-w-md rounded-3xl p-6 text-center shadow-xl">
          <h3 className="text-xl font-black">Игра окончена</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Собрано яблок: <b>{apples}</b>. Можно сыграть ещё раз или забрать награду за текущий результат.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                setGameKey((k) => k + 1);
                setPhase('playing');
              }}>
              Сыграть ещё раз
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={apples < 1}
              onClick={() => claimBonus(Math.max(1, apples))}>
              Забрать награду
            </Button>
          </div>
        </div>
      )}

      {phase === 'won' && (
        <div className="glass-card w-full max-w-md rounded-3xl p-6 text-center shadow-xl">
          <h3 className="text-xl font-black">Победа!</h3>
          <p className="mt-2 text-sm text-neutral-600">Вы собрали максимум — {WIN_APPLES} бонусов.</p>
          <div className="mt-6 flex justify-center">
            <Button type="button" onClick={() => claimBonus(WIN_APPLES)}>
              Забрать награду
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
