import ProductItemWrapper from '../shop/product-item-wrapper';
import styles from './CouponProductGrid.module.css';

export default function CouponProductGrid({ products, coupon }) {
  if (!products || products.length === 0) {
    return (
      <div className={styles.noProducts}>
        <p>No products available for this coupon.</p>
      </div>
    );
  }

  return (
    <div className={styles.productGridContainer}>
      <div className={styles.gridHeader}>
        <h4 className={styles.gridTitle}>
          Products Eligible for {coupon.couponCode}
        </h4>
        <span className={styles.productCount}>
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      <div className={styles.productGrid}>
        {products.map((product, index) => (
          <div key={product._id || index} className={styles.productGridItem}>
            <ProductItemWrapper
              product={product}
              coupons={[coupon]} // Pass the current coupon to show it applies
            />
          </div>
        ))}
      </div>

      {products.length > 8 && (
        <div className={styles.viewMoreContainer}>
          <button className={styles.viewMoreBtn}>
            View All {products.length} Products
          </button>
        </div>
      )}
    </div>
  );
}
