import TrackOrderArea from '@/components/version-tsx/order/track-order-area';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EWO - Track Order',
  alternates: {
    canonical: '/track-order',
  },
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  "use cache";
  const id = (await params).id;
  return <TrackOrderArea orderId={id} />;
}

