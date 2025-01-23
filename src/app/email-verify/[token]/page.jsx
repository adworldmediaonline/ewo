import EmailVerifyArea from '@/components/email-verify/email-verify-area';

export const metadata = {
  title: 'EWO- Email Verify Page',
};

export default async function EmailVerifyPage(props) {
  const params = await props.params;
  return (
    <>
      <EmailVerifyArea token={params.token} />
    </>
  );
}
