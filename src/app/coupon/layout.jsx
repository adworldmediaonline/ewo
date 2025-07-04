import ShopBreadcrumb from '../../components/breadcrumb/shop-breadcrumb';
import Footer from '../../layout/footers/footer';

import HeaderV2 from '../../layout/headers/HeaderV2';
import Wrapper from '../../layout/wrapper';

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
