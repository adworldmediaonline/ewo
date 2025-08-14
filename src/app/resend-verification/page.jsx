import ResendVerificationArea from '@/components/login-register/resend-verification-area';
import Wrapper from '@/components/wrapper';
const styles = new Proxy({}, { get: () => '' });

export const metadata = {
  title: 'EWO - Resend Verification',
  alternates: {
    canonical: '/resend-verification',
  },
};

export default function ResendVerificationPage() {
  return (
    <div className="">
      <Wrapper>
        <ResendVerificationArea />
      </Wrapper>
    </div>
  );
}
