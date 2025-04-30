import styles from './page.module.css';

export default function HistoryPage() {
  return (
    <div className={styles.content}>
      <h1 className={styles.title}>Built by Off-Roaders, for Off-Roaders.</h1>

      <p className={styles.intro}>
        At East West Offroad Products LLC, we didn't start this company because
        it was easy — we started it because it was necessary.
      </p>

      <p className={styles.intro}>
        As off-roading enthusiasts ourselves, we were tired of seeing overpriced
        steering and suspension parts that didn't always deliver on quality.
      </p>

      <p className={styles.intro}>
        We knew there had to be a better way — so in 2015, we set out to create
        it.
      </p>

      <div>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <p className={styles.sectionText}>
            What began as a personal mission to build better rigs has grown into
            a trusted brand known for high-performance, American-made steering
            and suspension components.
          </p>
          <p className={styles.sectionText}>
            We believe in doing things the right way:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Using premium-grade materials sourced from America.
            </li>
            <li className={styles.listItem}>
              Engineering parts that can handle real-world abuse on rocks, mud,
              and trails.
            </li>
            <li className={styles.listItem}>
              Offering honest pricing so you can spend less on parts and more on
              your adventures.
            </li>
          </ul>
          <p className={styles.sectionText}>
            Today, East West Offroad is proud to support thousands of
            off-roaders across the country — from weekend warriors to hardcore
            crawlers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Experience:</strong> We live the off-road lifestyle and
              know what real vehicles demand.
            </li>
            <li className={styles.listItem}>
              <strong>Quality:</strong> Every product is built with pride,
              toughness, and precision.
            </li>
            <li className={styles.listItem}>
              <strong>Customer First:</strong> We treat every customer the way
              we would expect to be treated — with respect, honesty, and
              support.
            </li>
          </ul>
        </section>

        <div className={styles.ctaBox}>
          <h3 className={styles.ctaTitle}>Join Our Off-Road Family</h3>
          <p className={styles.ctaText}>
            Whether you're upgrading your trail rig or building your dream
            crawler, we're here to help you go farther, climb higher, and push
            harder.
          </p>
          <p className={styles.ctaText}>
            Thank you for making East West Offroad part of your journey.
          </p>
          <p className={styles.ctaText}>
            The trail is calling — let's get you ready.
          </p>
          {/*
          <div className={styles.contactInfo}>
            <p className={styles.companyName}>East West Offroad Products LLC</p>
            <p className={styles.contactDetail}>Email: TBA</p>
            <p className={styles.contactDetail}>Phone: +1 (866) 396 7623</p>
            <p className={styles.contactDetail}>
              Address: PO Box 2644 Everett WA 98213
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
