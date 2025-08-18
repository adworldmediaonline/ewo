import styles from './page.module.css';

export const metadata = {
  title: 'Terms of Use - East West Offroad',
  alternates: {
    canonical: '/terms',
  },
};
export default function TermsPage() {
  return (
    <div className={styles.termsPage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Terms of Use</h1>
          <p className={styles.date}>Effective Date: April 27, 2025</p>

          <p className={styles.intro}>
            Welcome to East West Offroad Products LLC ("Company," "we," "our,"
            or "us"). These Terms of Use ("Terms") govern your use of our
            website located at www.eastwestoffroad.com
          </p>
          <p className={styles.intro}>
            By accessing or using the Website, you agree to be bound by these
            Terms. If you do not agree, you may not use our Website.
          </p>

          <div>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Use of Website</h2>
              <p className={styles.sectionText}>
                You agree to use our Website for lawful purposes only. You may
                not use our Website:
              </p>
              <ul className={styles.list}>
                <li className={styles.listItem}>
                  To violate any applicable laws or regulations.
                </li>
                <li className={styles.listItem}>
                  To infringe the rights of others, including intellectual
                  property rights.
                </li>
                <li className={styles.listItem}>
                  To upload or transmit viruses, malware, or harmful code.
                </li>
              </ul>
              <p className={styles.sectionText}>
                We reserve the right to restrict or terminate your access to the
                Website at any time without notice if you violate these Terms.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Intellectual Property</h2>
              <p className={styles.sectionText}>
                All content on this Website, including text, graphics, logos,
                images, videos, and software, is the property of East West
                Offroad Products LLC or its licensors, and is protected by U.S.
                and international copyright, trademark, and other intellectual
                property laws.
              </p>
              <p className={styles.sectionText}>
                You may not use, copy, modify, distribute, or reproduce any
                content without our prior written permission.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                3. Product Information and Pricing
              </h2>
              <p className={styles.sectionText}>
                We make every effort to ensure the accuracy of product
                descriptions, images, pricing, and availability. However, we do
                not guarantee that all information on our Website is complete,
                current, or error-free.
              </p>
              <p className={styles.sectionText}>
                We reserve the right to correct any errors, update information,
                or cancel orders if any information is inaccurate at any time
                without prior notice.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>4. Payment Terms</h2>
              <p className={styles.sectionText}>
                All payments must be made at the time of purchase. We accept
                major credit cards and other payment methods as specified on our
                Website.
              </p>
              <p className={styles.sectionText}>
                Prices are listed in U.S. dollars unless otherwise stated.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>5. Shipping and Returns</h2>
              <p className={styles.sectionText}>
                Shipping and return policies are detailed separately [here] (you
                can link to your Shipping & Return Policy page). By placing an
                order, you agree to the terms outlined in those policies.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                6. Disclaimer of Warranties
              </h2>
              <p className={styles.sectionText}>
                Our Website and products are provided on an "as-is" and
                "as-available" basis.
              </p>
              <p className={styles.sectionText}>
                We disclaim all warranties, express or implied, including
                warranties of merchantability, fitness for a particular purpose,
                and non-infringement.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                7. Limitation of Liability
              </h2>
              <p className={styles.sectionText}>
                In no event shall East West Offroad Products LLC, its directors,
                employees, or agents be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of your
                use of the Website or the products purchased through the
                Website.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>8. Indemnification</h2>
              <p className={styles.sectionText}>
                You agree to indemnify, defend, and hold harmless East West
                Offroad Products LLC from any claims, damages, losses,
                liabilities, and expenses (including attorneys' fees) arising
                from your use of the Website or violation of these Terms.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>9. Governing Law</h2>
              <p className={styles.sectionText}>
                These Terms shall be governed by and construed in accordance
                with the laws of the State of Washington, without regard to
                conflict of law principles.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>10. Changes to Terms</h2>
              <p className={styles.sectionText}>
                We reserve the right to update or modify these Terms at any time
                without prior notice.
              </p>
              <p className={styles.sectionText}>
                Your continued use of the Website after changes means you accept
                the revised Terms.
              </p>
            </section>

            <div className={styles.contactBox}>
              <h3 className={styles.contactTitle}>11. Contact Information</h3>
              <p className={styles.sectionText}>
                For any questions about these Terms, please contact us at:
              </p>

              <div className={styles.contactInfo}>
                <p className={styles.companyName}>
                  East West Offroad Products LLC
                </p>
                <p className={styles.contactDetail}>
                  Email:{' '}
                  <a
                    href="mailto:info@eastwestoffroad.com"
                    className={styles.contactLink}
                  >
                    info@eastwestoffroad.com
                  </a>
                </p>
                <p className={styles.contactDetail}>
                  Phone:{' '}
                  <a href="tel:1-866-396-7623" className={styles.contactLink}>
                    1-866-EWO-ROAD (396-7623)
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
