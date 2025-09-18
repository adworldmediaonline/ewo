# PostHog Implementation Guide

This document explains how PostHog analytics and session recording has been implemented throughout the eCommerce application following best practices.

## 🚀 Quick Start

### 1. Environment Setup

Add these environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### 2. Features Implemented

✅ **Session Recording** - Automatically captures user sessions with privacy controls
✅ **eCommerce Tracking** - Complete add to cart, purchase, and product view tracking
✅ **Exception Tracking** - Comprehensive error and exception monitoring
✅ **User Identification** - Proper user tracking after authentication
✅ **Page View Tracking** - Automatic page navigation tracking
✅ **Custom Events** - Business-specific event tracking

## 📊 Event Tracking

### eCommerce Events

The following events are automatically tracked:

- `product_viewed` - When a product is displayed
- `product_added_to_cart` - When user adds product to cart
- `product_removed_from_cart` - When user removes product from cart
- `product_added_to_wishlist` - When user adds to wishlist
- `product_option_selected` - When user selects product options
- `search_performed` - When user searches for products
- `filter_applied` - When user applies filters

### Authentication Events

- `user_login_success` - Successful user login
- `user_register_success` - Successful user registration
- `user_logout_success` - User logout

### Error Tracking

All errors and exceptions are automatically captured with context:

- Validation errors (missing product options, etc.)
- API errors and failures
- Unexpected application errors
- Network errors

## 🛠 Implementation Details

### Client-Side Tracking

```typescript
import {
  trackAddToCart,
  captureEvent,
  captureException,
} from '@/lib/posthog-client';

// Track successful add to cart
trackAddToCart({
  product_id: product._id,
  product_name: product.title,
  product_category: product.category.name,
  product_price: finalPrice,
  product_sku: product.sku,
  quantity: 1,
  product_variant: selectedOption?.title,
});

// Track custom events
captureEvent('product_option_selected', {
  product_id: product._id,
  option_selected: option.title,
});

// Track exceptions
captureException(error, {
  action: 'handleAddToCart',
  product_id: product._id,
  context: additionalData,
});
```

### Server-Side Tracking

```typescript
import { captureServerException } from '@/lib/posthog-server';

export const serverAction = async (formData: FormData) => {
  try {
    // Business logic
    const result = await processData(formData);
    return { success: true, data: result };
  } catch (error) {
    // Track server-side exceptions
    await captureServerException(error, 'serverAction', {
      form_data: formData,
      additional_context: context,
    });

    return { success: false, message: 'Operation failed' };
  }
};
```

### Authentication Integration

```typescript
import { usePostHogAuth } from '@/hooks/use-posthog-auth';

const { handleLogin, handleRegistration, handleLogout } = usePostHogAuth();

// After successful login
handleLogin(userId, {
  email: user.email,
  name: user.name,
  plan: user.plan,
});

// After successful registration
handleRegistration(userId, {
  email: user.email,
  registration_method: 'email',
});

// During logout
handleLogout();
```

## 🔧 Configuration

### Session Recording Settings

- **Mask Inputs**: Passwords and emails are automatically masked
- **Capture Events**: Click, change, and submit events are captured
- **Privacy**: Only identified users have full session recording enabled

### AutoCapture Settings

Elements with these attributes are automatically tracked:

- `data-ph-capture`
- `data-posthog-capture`
- `.ph-capture` class

Example:

```html
<button data-ph-capture="add-to-cart-button">Add to Cart</button>
```

## 📈 Analytics Dashboard

### Key Metrics to Monitor

1. **Conversion Funnel**

   - Product views → Add to cart → Checkout → Purchase

2. **User Behavior**

   - Session duration
   - Page views per session
   - Bounce rate

3. **eCommerce Performance**

   - Cart abandonment rate
   - Average order value
   - Product performance

4. **Error Monitoring**
   - Exception frequency
   - Error types and patterns
   - User impact analysis

### Custom Dashboards

Create dashboards in PostHog for:

- **eCommerce Overview**: Sales, conversions, top products
- **User Journey**: Registration → First purchase flow
- **Product Performance**: Views, adds to cart, purchases by product
- **Error Monitoring**: Exception trends and user impact

## 🔒 Privacy & Compliance

### Data Collection

- **PII Protection**: Passwords, credit cards, and sensitive data are masked
- **User Consent**: Session recording only enabled for identified users
- **Data Retention**: Configurable retention periods
- **GDPR Compliance**: User data can be deleted on request

### Sensitive Data Handling

```typescript
// Sanitize sensitive data before tracking
const sanitizedData = {
  ...formData,
  password: '[REDACTED]',
  creditCard: '[REDACTED]',
  ssn: '[REDACTED]',
};

captureException(error, { form_data: sanitizedData });
```

## 🚨 Troubleshooting

### Common Issues

1. **Events Not Appearing**

   - Check environment variables are set
   - Verify PostHog project key is correct
   - Check browser console for errors

2. **Session Recording Not Working**

   - Ensure user is identified
   - Check privacy settings
   - Verify domain is allowlisted in PostHog

3. **Server-Side Tracking Issues**
   - Check server environment variables
   - Verify network connectivity
   - Check PostHog server logs

### Debug Mode

Enable debug mode in development:

```typescript
// In development only
if (process.env.NODE_ENV === 'development') {
  posthog.debug();
}
```

## 📝 Best Practices

### Do's ✅

- Always include context in exception tracking
- Use descriptive event names
- Track user journey milestones
- Sanitize sensitive data
- Use consistent property naming

### Don'ts ❌

- Don't track PII without consent
- Don't over-track (avoid noise)
- Don't hardcode event names
- Don't track in server actions (exceptions only)
- Don't include sensitive data in events

## 🔄 Maintenance

### Regular Tasks

1. **Review Event Names**: Ensure consistency across the application
2. **Monitor Data Quality**: Check for missing or incorrect data
3. **Update Privacy Settings**: Adjust based on compliance requirements
4. **Performance Review**: Monitor impact on application performance
5. **Dashboard Updates**: Keep analytics dashboards relevant

### Updates & Migrations

When updating PostHog or changing tracking:

1. Test in development environment
2. Verify data continuity
3. Update documentation
4. Train team on new features
5. Monitor for issues post-deployment

## 📞 Support

For issues or questions:

1. Check PostHog documentation: https://posthog.com/docs
2. Review implementation in `/src/lib/posthog-*` files
3. Check console logs for errors
4. Contact development team for custom tracking needs

---

This implementation provides comprehensive analytics coverage while maintaining user privacy and following PostHog best practices.
