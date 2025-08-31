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
  console.log('💡 Navigate to /cart or /checkout to see auto-fill in action');
  console.log('🎯 On cart page: Should auto-show coupon form and fill code');
}

// Test cart page auto-fill functionality
function testCartAutoFill() {
  console.log('🧪 Testing cart auto-fill functionality...');

  // Set a test coupon for cart
  localStorage.setItem('pendingCouponCode', 'CART_AUTO_FILL_TEST');

  console.log('✅ Set test coupon for cart auto-fill');
  console.log('💡 Navigate to /cart - should automatically:');
  console.log('   1. Coupon form is always visible (no toggle)');
  console.log('   2. Fill the coupon code in the input field');
  console.log('   3. Show helpful message');
}

// Export for console use
if (typeof window !== 'undefined') {
  window.testCouponFetch = testCouponFetch;
  window.testLocalStorageAutoFill = testLocalStorageAutoFill;
  window.testCartAutoFill = testCartAutoFill;

  console.log('🔧 Test functions available:');
  console.log('- testCouponFetch() - Test backend API');
  console.log('- testLocalStorageAutoFill() - Test localStorage auto-fill');
  console.log('- testCartAutoFill() - Test cart auto-fill functionality');
}

// Auto-run if in browser
if (typeof window !== 'undefined' && window.location) {
  console.log('🚀 Auto-running coupon API test...');
  testCouponFetch();
}

export { testCartAutoFill, testCouponFetch, testLocalStorageAutoFill };
