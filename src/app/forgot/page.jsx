import ForgotArea from '@/components/login-register/forgot-area';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Forgot Password',
  alternates: {
    canonical: '/forgot',
  },
};

export default function ForgotPage() {
  return (
    <Wrapper>
      {/* <HeaderV2 /> */}
      {/* <CommonBreadcrumb
        title="Forgot Password"
        subtitle="Reset Password"
        center={true}
      /> */}
      <ForgotArea />
      {/* <Footer primary_style={true} /> */}
    </Wrapper>
  );
}
