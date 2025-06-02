import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
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
    <Wrapper>
      <HeaderV2 />
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutContainer}>
          <div className={styles.checkoutHeader}>
            <h1 className={styles.checkoutTitle}>Checkout</h1>
          </div>
          <CheckoutArea />
        </div>
      </div>
      <Footer style_2={true} />
    </Wrapper>
  );
}
