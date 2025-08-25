import ProductItemWrapper from '../shop/product-item-wrapper';

export default function CouponProductGrid({ products, coupon }) {
  if (!products || products.length === 0) {
    return (
      <div className="">
        <p>No products available for this coupon.</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <h4 className="">Products Eligible for {coupon.couponCode}</h4>
        <span className="">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      <div className="">
        {products.map((product, index) => (
          <div key={product._id || index} className="">
            <ProductItemWrapper
              product={product}
              coupons={[coupon]} // Pass the current coupon to show it applies
            />
          </div>
        ))}
      </div>

      {products.length > 8 && (
        <div className="">
          <button className="">View All {products.length} Products</button>
        </div>
      )}
    </div>
  );
}
