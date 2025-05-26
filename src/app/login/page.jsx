import Wrapper from '@/layout/wrapper';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import LoginArea from '@/components/login-register/login-area';
import styles from './login.module.css';

export const metadata = {
  title: 'EWO- Login Page',
};

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <Wrapper>
        <HeaderV2 />
        <CommonBreadcrumb title="Login" subtitle="Login" center={true} />
        <LoginArea />
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
