import ShopBreadcrumb from '../../components/breadcrumb/shop-breadcrumb';
import Footer from '../../components/version-tsx/footer';

import HeaderV2 from '../../components/version-tsx/header';
import Wrapper from '../../components/wrapper';

export default function CouponLayout({ children }) {
  return (
    <Wrapper>
      <HeaderV2 />
      <ShopBreadcrumb subtitle="Coupons" />
      {children}
      <Footer style_2={true} />
    </Wrapper>
  );
}
