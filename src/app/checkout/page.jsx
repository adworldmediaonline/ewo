import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CheckoutArea from '@/components/checkout/checkout-area';
import styles from './checkout.module.css';

export const metadata = {
  title: 'EWO - Checkout',
  alternates: {
    canonical: '/checkout',
  },
};

export default function CheckoutPage() {
  return (
    <div className={styles.checkoutPage}>
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb title="Checkout" subtitle="Checkout" bg_clr={true} />
        <CheckoutArea />
        <Footer style_2={true} />
      </Wrapper>
    </div>
  );
}
