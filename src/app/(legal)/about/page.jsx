import Link from 'next/link';

export const metadata = {
  title: 'About Us - East West Offroad',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="">
      <div className="">
        <h1 className="">What We Do</h1>

        <p className="">
          At East West Offroad Products LLC, we are passionate about helping
          off-roading enthusiasts conquer the trails with confidence and
          reliability.
        </p>
        <p className="">
          We specialize in crafting high-quality steering and suspension
          components — without the inflated price tag.
        </p>

        <h2 className="">Our Mission</h2>
        <p className="">
          We believe that every off-roader deserves access to durable,
          performance-driven parts without overpaying.
        </p>
        <p className="">Our mission is simple:</p>
        <p className="">
          Deliver top-tier steering and suspension products at affordable prices
          to fuel your next adventure.
        </p>

        <h2 className="">What Sets Us Apart</h2>

        <div className="">
          <div className="">
            <h3 className="">Superior Quality</h3>
            <p className="">
              We use premium American materials and proven manufacturing
              techniques to build parts that withstand the harshest terrains.
            </p>
          </div>

          <div className="">
            <h3 className="">Affordable Pricing</h3>
            <p className="">
              We limit our operational cost and excessive markups, bringing you
              exceptional components at a fair price.
            </p>
          </div>

          <div className="">
            <h3 className="">Off-Road Expertise</h3>
            <p className="">
              We design, test, and fine-tune our products specifically for the
              needs of real off-road enthusiasts — because that's who we are
              too.
            </p>
          </div>

          <div className="">
            <h3 className="">Customer Commitment</h3>
            <p className="">
              Your satisfaction drives everything we do. We proudly back our
              products with a 100% guarantee.
            </p>
          </div>
        </div>

        <p className="">
          Whether you're building a rock crawler, trail rig, or overlanding
          setup, our components are engineered to perform when it matters most.
        </p>

        <div className="">
          <h3 className="">Ready to upgrade your off-road machine?</h3>
          <p className="">
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
