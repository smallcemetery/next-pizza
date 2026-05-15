import { MockPaymentForm } from '@/shared/components/shared/mock-payment-form';

export default function MockPaymentPage({
  searchParams,
}: {
  searchParams: { orderId?: string; amount?: string };
}) {
  const orderId = Number(searchParams.orderId);
  const amount = Number(searchParams.amount);
  return <MockPaymentForm orderId={orderId} amount={amount} />;
}
