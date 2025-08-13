import RegisterArea from '@/components/login-register/register-area';
import Wrapper from '@/layout/wrapper';

export const metadata = {
  title: 'EWO - Register',
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterPage() {
  return (
    <div className="">
      <Wrapper>
        {/* <HeaderV2 /> */}
        {/* <CommonBreadcrumb title="Register" subtitle="Register" center={true} /> */}
        <RegisterArea />
        {/* <Footer primary_style={true} /> */}
      </Wrapper>
    </div>
  );
}
