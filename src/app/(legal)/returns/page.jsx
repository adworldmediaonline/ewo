import styles from './page.module.css';

export const metadata = {
  title: 'Returns - East West Offroad',
  alternates: {
    canonical: '/returns',
  },
};
export default function ReturnsPage() {
  return (
    <div className={styles.returnsPage}>
      <div className={styles.content}>
        <h1 className={styles.title}>Refund and Return Policy</h1>
        <p className={styles.date}>Effective Date: April 27, 2025</p>

        <p className={styles.intro}>
          At East West Offroad Products LLC, your satisfaction is important to
          us. If for any reason you are not completely satisfied with your
          purchase, we offer a simple and transparent return policy.
        </p>

        <div>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Return Period</h2>
            <p className={styles.sectionText}>
              You have 30 days from the date of delivery to return any item for
              any reason.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Return Conditions</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Items must be returned in new, unused, and uninstalled
                condition.
              </li>
              <li className={styles.listItem}>
                Items must include all original packaging, hardware, and
                accessories.
              </li>
              <li className={styles.listItem}>
                Returns that are damaged, used, or missing parts may be subject
                to additional fees or denied.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Restocking Fee</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                All returns are subject to a 15% restocking fee unless you
                qualify for a special case.
              </li>
              <li className={styles.listItem}>
                The restocking fee will be deducted from your refund amount.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Non-Returnable Items</h2>
            <p className={styles.sectionText}>
              Certain items are non-returnable, including:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Any item sold as "Non Returnable"
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. How to Start a Return</h2>
            <p className={styles.sectionText}>
              To initiate a return, please contact us at:
            </p>
            <div className={styles.contactBox}>
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
                  1-866-396-7623
                </a>
              </p>
            </div>
            <p className={styles.sectionText}>
              We will provide you with a Return Authorization (RA) number and
              instructions for sending your item back.
            </p>
            <p className={styles.sectionText}>
              Returns without a valid RA number will not be accepted.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Refund Processing</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Once we receive and inspect your return, we will issue a refund
                to your original method of payment.
              </li>
              <li className={styles.listItem}>
                Refunds are typically processed within 7–10 business days after
                we receive the returned item.
              </li>
              <li className={styles.listItem}>
                Shipping charges are non-refundable.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Return Shipping</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Customers are responsible for return shipping costs.
              </li>
              <li className={styles.listItem}>
                We recommend using a trackable shipping service and purchasing
                shipping insurance.
              </li>
              <li className={styles.listItem}>
                We are not responsible for returns lost in transit.
              </li>
            </ul>
          </section>

          <div className={styles.helpBox}>
            <h3 className={styles.helpTitle}>
              Need help or have questions about your return?
            </h3>
            <p className={styles.helpText}>
              Contact us anytime — we're happy to assist you!
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
                  1-866-396-7623
                </a>
              </p>
              <p className={styles.contactDetail}>
                Address: PO Box 2644 Everett WA 98213
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
