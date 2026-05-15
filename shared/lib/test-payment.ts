export async function createTestPayment(amount: number, orderId: number) {
  console.log(`[TEST MODE] Оплата заказа #${orderId} на сумму ${amount} руб.`);

  return {
    id: `test_${orderId}_${Date.now()}`,
    status: 'pending',
    confirmation: {
      confirmation_url: `/payment/mock?orderId=${orderId}&amount=${amount}`,
    },
  };
}