import Wrapper from '@/layout/wrapper';
import ResendVerificationArea from '@/components/login-register/resend-verification-area';
import styles from './resend-verification.module.css';

export const metadata = {
  title: 'EWO - Resend Verification',
  alternates: {
    canonical: '/resend-verification',
  },
};

export default function ResendVerificationPage() {
  return (
    <div className={styles.resendVerificationPage}>
      <Wrapper>
        <ResendVerificationArea />
      </Wrapper>
    </div>
  );
}
