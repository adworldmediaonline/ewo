'use client';

import CouponCard from '@/components/coupon/CouponCard';
import CouponProductGrid from '@/components/coupon/CouponProductGrid';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import Link from 'next/link';

export default function CouponPage() {
  const { data: coupons, isLoading, error } = useGetAllActiveCouponsQuery();

  if (isLoading) {
    return (
      <div className="">
        <div className="">
          <div className="">
            <div className=""></div>
            <div className="">
              <h3 className="">Finding the best deals...</h3>
              <p className="">
                Please wait while we load your exclusive offers
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="">
        <div className="">
          <div className="">
            <div className="">⚠️</div>
            <h3 className="">Oops! Something went wrong</h3>
            <p className="">
              We couldn't load the coupons right now. Please check your
              connection and try again.
            </p>
            <button className="" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coupons?.data || coupons.data.length === 0) {
    return (
      <div className="">
        <div className="">
          <div className="">
            <div className="">🎟️</div>
            <h2 className="">No Active Deals Right Now</h2>
            <p className="">
              Don't worry! We're constantly adding new deals and discounts.
              Check back soon or browse our products to find great automotive
              parts.
            </p>
            <div className="">
              <Link href="/shop" className="">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Browse Products
              </Link>
              <Link href="/contact" className="">
                🔔 Notify Me of Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Coupons List */}
        <div className="">
          {coupons.data.map((coupon, index) => (
            <div key={coupon._id || index} className="">
              <div className="">
                <CouponCard coupon={coupon} />
                <CouponProductGrid
                  products={coupon.applicableProducts}
                  coupon={coupon}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
