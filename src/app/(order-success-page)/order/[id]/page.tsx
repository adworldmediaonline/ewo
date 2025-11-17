import OrderArea from '@/components/version-tsx/order/order-area';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EWO - Order',
  alternates: {
    canonical: '/order',
  },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  // Wrapper is already in layout.jsx, so we don't need it here
  return <OrderArea orderId={id} />;
}
