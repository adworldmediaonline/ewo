import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import WishlistArea from '@/components/cart-wishlist/wishlist-area';
import styles from './wishlist.module.css';

export const metadata = {
  title: 'EWO - Wishlist',
  alternates: {
    canonical: '/wishlist',
  },
};

export default function WishlistPage() {
  return (
    <div className={styles.wishlistPage}>
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb title="Wishlist" subtitle="Wishlist" />
        <WishlistArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
