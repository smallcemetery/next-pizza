/** Запасное изображение блюда, если в БД нет URL или картинка не загрузилась */
export const PLACEHOLDER_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';

export function resolveImageUrl(url?: string | null): string {
  const t = url?.trim();
  if (!t) return PLACEHOLDER_FOOD_IMAGE;
  return t;
}
