import Wrapper from '@/layout/wrapper';
// import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import ShopBreadcrumb from '@/components/breadcrumb/shop-breadcrumb';
import ShopArea from '@/components/shop/shop-area';
import HeaderV2 from '@/layout/headers/HeaderV2';
import styles from './shop.module.css';

export const metadata = {
  title: 'EWO- Shop Page',
  description: 'EWO- Shop Page',
  alternates: {
    canonical: '/shop',
  },
};

export default function ShopPage() {
  return (
    <div className={styles.shopPage}>
      <Wrapper>
        <HeaderV2 />
        <ShopBreadcrumb subtitle="Shop" />
        <div className={styles.shopContainer}>
          <main className={styles.main}>
            <div className={styles.shopAreaWrapper}>
              <ShopArea />
            </div>
          </main>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
