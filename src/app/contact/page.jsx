import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';
import styles from './page.module.css';

export const metadata = {
  title: 'EWO - Contact Us',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className={styles.contactPage}>
      <Wrapper>
        <HeaderV2 />
        <div className={styles.contactContainer}>
          <div className={styles.contactContent}>
            <h1 className={styles.contactTitle}>Contact Us</h1>
            <div className={styles.comingSoonSection}>
              <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
              <p className={styles.comingSoonText}>
                We're working hard to bring you a great contact experience.
                Please check back soon!
              </p>
              <div className={styles.contactInfo}>
                <p className={styles.phoneInfo}>
                  <strong>Phone:</strong>
                  <a href="tel:1-866-396-7623" className={styles.contactLink}>
                    1-866-396-7623
                  </a>
                </p>
                <p className={styles.emailInfo}>
                  <strong>Email:</strong>
                  <a
                    href="mailto:info@eastwestoffroad.com"
                    className={styles.contactLink}
                  >
                    info@eastwestoffroad.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
