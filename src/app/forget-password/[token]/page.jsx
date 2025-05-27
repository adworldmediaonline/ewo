import ForgotPasswordArea from '@/components/fortgot-password/forgot-password-area';

export const metadata = {
  title: 'EWO - Forget Password',
  alternates: {
    canonical: '/forget-password',
  },
};

export default function ForgetPasswordPage({ params }) {
  return (
    <>
      <ForgotPasswordArea token={params.token} />
    </>
  );
}
