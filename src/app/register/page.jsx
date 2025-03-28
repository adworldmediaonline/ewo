import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import RegisterArea from '@/components/login-register/register-area';

export const metadata = {
  title: 'EWO- Register Page',
};

export default function RegisterPage() {
  return (
    <Wrapper>
      <HeaderV2 />
      <CommonBreadcrumb title="Register" subtitle="Register" center={true} />
      <RegisterArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
