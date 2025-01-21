import ForgotPasswordArea from '@/components/fortgot-password/forgot-password-area';

export const metadata = {
  title: 'EWO- Forget Password Page',
};

export default function ForgetPasswordPage({ params }) {
  return (
    <>
      <ForgotPasswordArea token={params.token} />
    </>
  );
}
