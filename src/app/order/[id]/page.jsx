import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import OrderArea from '@/components/order/order-area';

export const metadata = {
  title: 'EWO- Order Page',
};

export default async function OrderPage({ params }) {
  const id = (await params).id;
  return (
    <Wrapper>
      <HeaderV2 />
      <OrderArea orderId={id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
