import LoginArea from '@/components/login-register/login-area';
import Wrapper from '@/components/wrapper';

export const metadata = {
  title: 'EWO - Login',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return (
    <div className="">
      <Wrapper>
        {/* <HeaderV2 /> */}
        {/* <CommonBreadcrumb title="Login" subtitle="Login" center={true} /> */}
        <LoginArea />
        {/* <Footer primary_style={true} /> */}
      </Wrapper>
    </div>
  );
}
