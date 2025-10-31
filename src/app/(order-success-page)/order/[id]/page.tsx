import OrderArea from '@/components/version-tsx/order/order-area';
import Wrapper from '@/components/wrapper';
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
  "use cache";
  const id = (await params).id;
  return (
    <Wrapper>
      <OrderArea orderId={id} />
    </Wrapper>
  );
}
