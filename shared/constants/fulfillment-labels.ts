import { DeliveryType, FulfillmentStatus } from '@prisma/client';

export const fulfillmentLabel = (s: FulfillmentStatus, delivery: DeliveryType): string => {
  const map: Record<FulfillmentStatus, { delivery: string; pickup: string }> = {
    AWAITING_PAYMENT: { delivery: 'Ожидаем оплату', pickup: 'Ожидаем оплату' },
    PAID: { delivery: 'Оплачено', pickup: 'Оплачено' },
    IN_PROGRESS: { delivery: 'Принято в работу', pickup: 'Принято в работу' },
    WAITING_COURIER: { delivery: 'Ждём курьера', pickup: 'Ждём курьера' },
    DELIVERING: { delivery: 'Доставка', pickup: 'Доставка' },
    READY_FOR_PICKUP: { delivery: 'Готовится к выдаче', pickup: 'Забирайте заказ' },
    COMPLETED: { delivery: 'Завершено', pickup: 'Завершено' },
    CANCELLED: { delivery: 'Отменено', pickup: 'Отменено' },
  };
  const row = map[s];
  return delivery === DeliveryType.PICKUP ? row.pickup : row.delivery;
};
