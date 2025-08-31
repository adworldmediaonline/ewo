/**
 * Test script to verify coupon fetching is working
 * Run this in browser console to test the coupon API
 */

// Test function to check if coupon API is working
async function testCouponFetch() {
  try {
    console.log('🧪 Testing coupon API...');

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
    const response = await fetch(`${apiBaseUrl}/api/coupon/valid/list`);

    console.log('📡 API Response Status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Raw API Data:', data);

    if (data.success && data.data && Array.isArray(data.data)) {
      console.log('✅ Coupons fetched successfully!');
      console.log(`📊 Total coupons: ${data.data.length}`);

      data.data.forEach((coupon, index) => {
        console.log(`🎟️ Coupon ${index + 1}:`, {
          code: coupon.couponCode,
          title: coupon.title,
          discountType: coupon.discountType,
          discountAmount: coupon.discountAmount,
          discountPercentage: coupon.discountPercentage,
          minimumAmount: coupon.minimumAmount,
          status: coupon.status,
        });
      });

      // Test auto-fill logic
      const activeCoupons = data.data.filter(
        coupon => coupon.status === 'active' && coupon.couponCode
      );

      if (activeCoupons.length > 0) {
        console.log(
          '🎯 Auto-fill would work with these coupons:',
          activeCoupons.map(c => c.couponCode)
        );
      } else {
        console.log('⚠️ No active coupons available for auto-fill');
      }
    } else {
      console.error('❌ Invalid API response format:', data);
    }
  } catch (error) {
    console.error('❌ Error testing coupon API:', error);
    console.log('💡 Make sure the backend is running and accessible');
  }
}

// Test localStorage functionality
function testLocalStorageAutoFill() {
  console.log('🧪 Testing localStorage auto-fill...');

  // Set a test coupon
  localStorage.setItem(
    'pendingCouponCode',
    JSON.stringify({
      code: 'TEST_COUPON',
      timestamp: Date.now(),
    })
  );

  console.log('✅ Set test coupon in localStorage');
  console.log('💡 Navigate to /checkout to see auto-fill in action');
}

// Export for console use
if (typeof window !== 'undefined') {
  window.testCouponFetch = testCouponFetch;
  window.testLocalStorageAutoFill = testLocalStorageAutoFill;

  console.log('🔧 Test functions available:');
  console.log('- testCouponFetch() - Test backend API');
  console.log('- testLocalStorageAutoFill() - Test localStorage auto-fill');
}

// Auto-run if in browser
if (typeof window !== 'undefined' && window.location) {
  console.log('🚀 Auto-running coupon API test...');
  testCouponFetch();
}

export { testCouponFetch, testLocalStorageAutoFill };
