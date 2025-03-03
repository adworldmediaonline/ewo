import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CheckoutArea from '@/components/checkout/checkout-area';

export const metadata = {
  title: 'EWO- Checkout Page',
};

export default function CheckoutPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb title="Checkout" subtitle="Checkout" bg_clr={true} />
      <CheckoutArea />
      <Footer style_2={true} />
    </Wrapper>
  );
}
