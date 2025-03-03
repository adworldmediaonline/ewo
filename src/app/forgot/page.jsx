import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import ForgotArea from '@/components/login-register/forgot-area';

export const metadata = {
  title: 'EWO- Forgot Page',
};

export default function ForgotPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb
        title="Forgot Password"
        subtitle="Reset Password"
        center={true}
      />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
