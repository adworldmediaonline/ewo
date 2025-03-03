import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import WishlistArea from '@/components/cart-wishlist/wishlist-area';

export const metadata = {
  title: 'EWO- Wishlist Page',
};

export default function WishlistPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb title="Wishlist" subtitle="Wishlist" />
      <WishlistArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
