# Google Analytics 4 Integration Guide

This guide explains how to use the GA4 analytics system implemented in this Next.js application.

## Overview

The analytics system includes:

- **Consent Management**: GDPR-compliant cookie consent banner
- **GA4 Integration**: Using @next/third-parties/google for optimal performance
- **E-commerce Tracking**: Comprehensive e-commerce event tracking
- **Custom Events**: Track user interactions and business metrics

## Setup

### 1. Environment Configuration

The GA measurement ID is configured in `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-X6DHBPKKZW
```

### 2. Root Layout Integration

GA4 is integrated in the root layout with consent handling:

```tsx
import { AnalyticsProvider } from "@/components/analytics-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>{/* Your app content */}</AnalyticsProvider>
      </body>
    </html>
  );
}
```

## Components

### Consent Banner

Automatically displays when users haven't made a consent choice:

- Stores preferences in localStorage
- Supports granular consent (necessary, analytics, marketing)
- Only loads GA4 after analytics consent is given

### Analytics Provider

Wraps the app and manages:

- Google Analytics initialization
- Consent state management
- Conditional script loading

## Usage

### Basic Event Tracking

```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function MyComponent() {
  const { trackCustomEvent } = useAnalytics();

  const handleClick = () => {
    trackCustomEvent("button_click", {
      button_name: "hero_cta",
      page: "/home",
    });
  };
}
```

### E-commerce Event Tracking

#### Product Views

```tsx
const { trackProductView } = useAnalytics();

trackProductView({
  id: "prod_123",
  name: "VitalityBoost X",
  price: 49.99,
  category: "Supplements",
  brand: "Verified Supplements",
});
```

#### Add to Cart

```tsx
const { trackAddToCartEvent } = useAnalytics();

trackAddToCartEvent([
  {
    id: "prod_123",
    name: "VitalityBoost X",
    price: 49.99,
    quantity: 1,
    category: "Supplements",
  },
]);
```

#### Purchase Tracking

```tsx
const { trackPurchaseEvent } = useAnalytics();

trackPurchaseEvent(
  "txn_12345",
  cartItems,
  totalAmount,
  "USD",
  shippingCost,
  taxAmount,
  couponCode
);
```

### Page and Scroll Tracking

```tsx
import { usePageTracking, useScrollTracking } from "@/hooks/use-analytics";

function MyPage() {
  // Automatically track page views
  usePageTracking();

  // Track scroll depth milestones
  useScrollTracking();

  return <div>Page content</div>;
}
```

### Form Tracking

```tsx
import { useFormTracking } from "@/hooks/use-analytics";

function ContactForm() {
  const { trackFormStart, trackFormSubmit, trackFormError } =
    useFormTracking("contact_form");

  useEffect(() => {
    trackFormStart();
  }, []);

  const handleSubmit = async () => {
    try {
      await submitForm();
      trackFormSubmit(true);
    } catch (error) {
      trackFormError("submission_failed", error.message);
    }
  };
}
```

## Available Analytics Functions

### Core Functions (lib/analytics.ts)

- `trackEvent(eventName, parameters)` - Generic event tracking
- `trackPageView(title, location)` - Page view tracking

### E-commerce Functions

- `trackViewItem(item)` - Product page views
- `trackViewItemList(items, listName)` - Product list views
- `trackSelectItem(item, listName)` - Product selections
- `trackAddToCart(items)` - Add to cart events
- `trackRemoveFromCart(items)` - Remove from cart events
- `trackViewCart(items)` - Cart page views
- `trackBeginCheckout(ecommerceData)` - Checkout initiation
- `trackAddPaymentInfo(ecommerceData, paymentType)` - Payment method selection
- `trackPurchase(ecommerceData)` - Purchase completion
- `trackRefund(transactionId, value, currency, items)` - Refund tracking

### Custom Business Events

- `trackSearch(searchTerm, resultsCount)` - Search tracking
- `trackShare(contentType, contentId, method)` - Social sharing
- `trackSignUp(method)` - User registration
- `trackLogin(method)` - User login
- `trackNewsletterSignup(method)` - Newsletter subscriptions

### Utility Functions

- `createEcommerceItem(product)` - Convert product data to GA4 format
- `generateTransactionId()` - Generate unique transaction IDs
- `hasConsentFor(type)` - Check consent status
- `getConsentPreferences()` - Get all consent preferences

## Data Layer Events

The following GA4 events are automatically tracked:

### Enhanced E-commerce Events

- `view_item` - Product page views
- `view_item_list` - Category/search results
- `select_item` - Product clicks
- `add_to_cart` - Add to cart actions
- `remove_from_cart` - Remove from cart actions
- `view_cart` - Cart page views
- `begin_checkout` - Checkout initiation
- `add_payment_info` - Payment method selection
- `purchase` - Purchase completion
- `refund` - Refund processing

### Custom Events

- `scroll_depth` - Scroll milestones (25%, 50%, 75%, 90%, 100%)
- `form_start` - Form interaction begins
- `form_submit` - Form submission
- `form_error` - Form validation errors
- `click_external_link` - External link clicks
- `newsletter_signup` - Newsletter subscriptions
- `file_download` - File downloads
- `video_play` - Video interactions

## Best Practices

### 1. Consent First

Always check for analytics consent before tracking:

```tsx
import { hasConsentFor } from "@/components/consent-banner";

if (hasConsentFor("analytics")) {
  trackEvent("my_event", parameters);
}
```

### 2. Error Handling

Wrap analytics calls in try-catch blocks:

```tsx
try {
  trackEvent("purchase", ecommerceData);
} catch (error) {
  console.error("Analytics tracking failed:", error);
}
```

### 3. Performance

- Analytics only loads after consent
- Uses @next/third-parties for optimized loading
- Non-blocking implementation

### 4. Privacy Compliance

- Granular consent options
- Clear privacy information
- Easy consent withdrawal
- No tracking without consent

## Testing

### Development Testing

```tsx
// Enable console logging in development
if (process.env.NODE_ENV === "development") {
  console.log("GA4 Event:", eventName, parameters);
}
```

### GA4 Debug Mode

Add debug parameters for testing:

```tsx
trackEvent("test_event", {
  debug_mode: true,
  test_data: "value",
});
```

## Troubleshooting

### Common Issues

1. **Events not showing in GA4**

   - Check consent status
   - Verify GA measurement ID
   - Ensure gtag is loaded

2. **TypeScript errors**

   - Extend Window interface for gtag
   - Use proper event parameter types

3. **Consent not working**
   - Check localStorage for consent keys
   - Verify consent banner is displayed
   - Test consent state changes

### Debug Tools

- Use GA4 DebugView in Google Analytics
- Check browser console for analytics logs
- Use Google Tag Assistant browser extension

## Integration Examples

See the following components for implementation examples:

- `components/product-hero.tsx` - Product interaction tracking
- `components/product-card-with-analytics.tsx` - E-commerce event tracking
- `components/purchase-tracking.tsx` - Purchase completion tracking
- `hooks/use-analytics.tsx` - Custom analytics hooks
