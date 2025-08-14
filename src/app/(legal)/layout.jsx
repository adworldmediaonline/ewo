import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';

export default function LegalLayout({ children }) {
  return (
    <>
      <HeaderV2 />
      <main className="">{children}</main>
      <Footer />
    </>
  );
}
