import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CouponArea from '@/components/coupon/coupon-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: 'EWO - Coupon',
  alternates: {
    canonical: '/coupon',
  },
};

export default function CouponPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb subtitle="Coupon" />
      <CouponArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
