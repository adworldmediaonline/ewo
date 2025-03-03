import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import OrderArea from '@/components/order/order-area';

export const metadata = {
  title: 'EWO- Order Page',
};

export default function OrderPage({ params }) {
  return (
    <Wrapper>
      <HeaderV2 />
      <OrderArea orderId={params.id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
