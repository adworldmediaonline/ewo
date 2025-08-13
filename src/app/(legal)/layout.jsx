import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';

export default function LegalLayout({ children }) {
  return (
    <>
      <HeaderV2 />
      <main className="">{children}</main>
      <Footer />
    </>
  );
}
