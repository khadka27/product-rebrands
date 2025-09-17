"use client";

import { useEffect, useCallback } from "react";
import {
  trackEvent,
  trackPageView,
  trackAddToCart,
  trackViewItem,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  type EcommerceItem,
  type EcommerceEvent,
  createEcommerceItem,
} from "@/lib/analytics";

// Hook for tracking page views
export const usePageTracking = () => {
  useEffect(() => {
    // Track initial page view
    trackPageView(document.title);
  }, []);
};

// Hook for tracking scroll depth
export const useScrollTracking = () => {
  useEffect(() => {
    let maxScrollDepth = 0;
    const trackingIntervals = [25, 50, 75, 90, 100];
    const trackedDepths = new Set<number>();

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;

        // Track milestone scroll depths
        trackingIntervals.forEach((interval) => {
          if (scrollDepth >= interval && !trackedDepths.has(interval)) {
            trackedDepths.add(interval);
            trackEvent("scroll_depth", {
              scroll_depth: interval,
              page_title: document.title,
              page_location: window.location.href,
            });
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
};

// Custom analytics hook with common e-commerce functions
export const useAnalytics = () => {
  const trackProductView = useCallback(
    (product: {
      id: string;
      name: string;
      price: number;
      category?: string;
      brand?: string;
    }) => {
      const item = createEcommerceItem(product);
      trackViewItem(item);
    },
    []
  );

  const trackAddToCartEvent = useCallback(
    (
      products: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        category?: string;
        brand?: string;
      }>
    ) => {
      const items = products.map((product) => createEcommerceItem(product));
      trackAddToCart(items);
    },
    []
  );

  const trackCheckoutBegin = useCallback(
    (
      cartItems: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        category?: string;
        brand?: string;
      }>,
      totalValue: number,
      currency: string = "USD"
    ) => {
      const items = cartItems.map((product) => createEcommerceItem(product));
      const ecommerceData: EcommerceEvent = {
        currency,
        value: totalValue,
        items,
      };
      trackBeginCheckout(ecommerceData);
    },
    []
  );

  const trackPurchaseEvent = useCallback(
    (
      transactionId: string,
      cartItems: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        category?: string;
        brand?: string;
      }>,
      totalValue: number,
      currency: string = "USD",
      shipping?: number,
      tax?: number,
      coupon?: string
    ) => {
      const items = cartItems.map((product) => createEcommerceItem(product));
      const ecommerceData: EcommerceEvent = {
        transaction_id: transactionId,
        currency,
        value: totalValue,
        items,
        shipping,
        tax,
        coupon,
      };
      trackPurchase(ecommerceData);
    },
    []
  );

  const trackSearchEvent = useCallback(
    (searchTerm: string, resultsCount?: number) => {
      trackSearch(searchTerm, resultsCount);
    },
    []
  );

  const trackCustomEvent = useCallback(
    (eventName: string, parameters?: Record<string, any>) => {
      trackEvent(eventName, parameters);
    },
    []
  );

  return {
    trackProductView,
    trackAddToCartEvent,
    trackCheckoutBegin,
    trackPurchaseEvent,
    trackSearchEvent,
    trackCustomEvent,
  };
};

// Hook for form tracking
export const useFormTracking = (formName: string) => {
  const trackFormStart = useCallback(() => {
    trackEvent("form_start", {
      form_name: formName,
      engagement_time_msec: Date.now(),
    });
  }, [formName]);

  const trackFormSubmit = useCallback(
    (success: boolean = true) => {
      trackEvent("form_submit", {
        form_name: formName,
        success,
        engagement_time_msec: Date.now(),
      });
    },
    [formName]
  );

  const trackFormError = useCallback(
    (errorType: string, errorMessage?: string) => {
      trackEvent("form_error", {
        form_name: formName,
        error_type: errorType,
        error_message: errorMessage,
      });
    },
    [formName]
  );

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
  };
};
