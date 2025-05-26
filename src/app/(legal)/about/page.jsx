import styles from './page.module.css';
import Link from 'next/link';
export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.content}>
        <h1 className={styles.title}>What We Do</h1>

        <p className={styles.intro}>
          At East West Offroad Products LLC, we are passionate about helping
          off-roading enthusiasts conquer the trails with confidence and
          reliability.
        </p>
        <p className={styles.intro}>
          We specialize in crafting high-quality steering and suspension
          components — without the inflated price tag.
        </p>

        <h2 className={styles.missionTitle}>Our Mission</h2>
        <p className={styles.missionText}>
          We believe that every off-roader deserves access to durable,
          performance-driven parts without overpaying.
        </p>
        <p className={styles.missionText}>Our mission is simple:</p>
        <p className={styles.missionText}>
          Deliver top-tier steering and suspension products at affordable prices
          to fuel your next adventure.
        </p>

        <h2 className={styles.differenceTitle}>What Sets Us Apart</h2>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Superior Quality</h3>
            <p className={styles.featureText}>
              We use premium American materials and proven manufacturing
              techniques to build parts that withstand the harshest terrains.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Affordable Pricing</h3>
            <p className={styles.featureText}>
              We limit our operational cost and excessive markups, bringing you
              exceptional components at a fair price.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Off-Road Expertise</h3>
            <p className={styles.featureText}>
              We design, test, and fine-tune our products specifically for the
              needs of real off-road enthusiasts — because that's who we are
              too.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Customer Commitment</h3>
            <p className={styles.featureText}>
              Your satisfaction drives everything we do. We proudly back our
              products with a 100% guarantee.
            </p>
          </div>
        </div>

        <p className={styles.conclusion}>
          Whether you're building a rock crawler, trail rig, or overlanding
          setup, our components are engineered to perform when it matters most.
        </p>

        <div className={styles.ctaBox}>
          <h3 className={styles.ctaTitle}>
            Ready to upgrade your off-road machine?
          </h3>
          <p className={styles.ctaText}>
            Explore our full lineup at{' '}
            <Link href="/" className="text-primary">
              www.eastwestoffroad.com
            </Link>{' '}
            and experience the East West Offroad difference.
          </p>
        </div>
      </div>
    </div>
  );
}
