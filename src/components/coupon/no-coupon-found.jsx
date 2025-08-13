import Link from 'next/link';

export default function NoCouponFound() {
  return (
    <div className="">
      <div className="">
        <div className="">
          <h1 className="">Active Coupons</h1>
          <p className="">Save big with our exclusive discount codes</p>
        </div>
        <div className="">
          <h2 className="">No Active Coupons</h2>
          <p className="">
            We don't have any active coupons at the moment. Check back later for
            amazing deals!
          </p>
          <Link href="/shop" className="">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
