import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CartArea from '@/components/cart-wishlist/cart-area';
import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Shopping Cart',
  alternates: {
    canonical: '/cart',
  },
};

export default function CartPage() {
  return (
    <div className="">
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb title="" subtitle="Shopping Cart" />
        <CartArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
