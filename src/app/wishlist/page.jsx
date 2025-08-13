import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import WishlistArea from '@/components/cart-wishlist/wishlist-area';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Wishlist',
  alternates: {
    canonical: '/wishlist',
  },
};

export default function WishlistPage() {
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb subtitle="Wishlist" />
        <WishlistArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
