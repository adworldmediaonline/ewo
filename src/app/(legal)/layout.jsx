import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import styles from './legal.module.css';

export default function LegalLayout({ children }) {
  return (
    <>
      <HeaderV2 />
      <main className={styles.container}>{children}</main>
      <Footer />
    </>
  );
}
