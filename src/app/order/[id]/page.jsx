import OrderArea from '@/components/order/order-area';
import HeaderV2 from '@/components/version-tsx/header';
import Wrapper from '@/components/wrapper';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO - Order',
  alternates: {
    canonical: '/order',
  },
};

export default async function OrderPage({ params }) {
  const id = (await params).id;
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <OrderArea orderId={id} />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
