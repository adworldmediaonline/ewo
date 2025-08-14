import Footer from '@/components/version-tsx/footer';
import HeaderV2 from '@/components/version-tsx/header';

export default function LegalLayout({ children }) {
  return (
    <>
      <HeaderV2 />
      <main className="">{children}</main>
      <Footer />
    </>
  );
}
