import Wrapper from '@/layout/wrapper';

import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CartArea from '@/components/cart-wishlist/cart-area';
import HeaderV2 from '@/layout/headers/HeaderV2';

export const metadata = {
  title: 'EWO- Cart Page',
};

export default function CartPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb title="Shopping Cart" subtitle="Shopping Cart" />
      <CartArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
