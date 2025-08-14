import CheckoutArea from '@/components/checkout/checkout-area';
import Footer from '@/components/version-tsx/footer';
import HeaderV2 from '@/components/version-tsx/header';
import Wrapper from '@/components/wrapper';

export const metadata = {
  title: 'EWO - Checkout',
  alternates: {
    canonical: '/checkout',
  },
};

export default function CheckoutPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <div className="">
        <div className="">
          <div className="">
            <h1 className="">Checkout</h1>
          </div>
          <CheckoutArea />
        </div>
      </div>
      <Footer style_2={true} />
    </Wrapper>
  );
}
