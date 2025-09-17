"use client";

import { hasConsentFor } from "@/components/consent-banner";

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// GA4 Event Types
export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

export interface EcommerceItem {
  item_id: string;
  item_name: string;
  category?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  brand?: string;
  variant?: string;
  price: number;
  quantity: number;
  currency?: string;
  coupon?: string;
  discount?: number;
}

export interface EcommerceEvent {
  currency: string;
  value: number;
  items: EcommerceItem[];
  transaction_id?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== "undefined" && typeof window.gtag === "function";
};

// Generic event tracking
export const trackEvent = (
  eventName: string,
  parameters: Record<string, any> = {}
) => {
  if (!hasConsentFor("analytics") || !isGtagAvailable()) {
    console.log(
      "Analytics tracking skipped - no consent or gtag not available"
    );
    return;
  }

  try {
    window.gtag("event", eventName, parameters);
    console.log("GA4 Event tracked:", eventName, parameters);
  } catch (error) {
    console.error("Error tracking GA4 event:", error);
  }
};

// Page view tracking (automatically handled by @next/third-parties, but can be used for SPAs)
export const trackPageView = (page_title: string, page_location?: string) => {
  trackEvent("page_view", {
    page_title,
    page_location: page_location || window.location.href,
  });
};

// E-commerce event tracking functions

export const trackViewItem = (item: EcommerceItem) => {
  trackEvent("view_item", {
    currency: item.currency || "USD",
    value: item.price,
    items: [item],
  });
};

export const trackViewItemList = (
  items: EcommerceItem[],
  list_name: string = "Search Results"
) => {
  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  trackEvent("view_item_list", {
    currency: items[0]?.currency || "USD",
    value: totalValue,
    items,
    item_list_name: list_name,
  });
};

export const trackSelectItem = (
  item: EcommerceItem,
  list_name: string = "Search Results"
) => {
  trackEvent("select_item", {
    currency: item.currency || "USD",
    value: item.price,
    items: [item],
    item_list_name: list_name,
  });
};

export const trackAddToCart = (items: EcommerceItem[]) => {
  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  trackEvent("add_to_cart", {
    currency: items[0]?.currency || "USD",
    value: totalValue,
    items,
  });
};

export const trackRemoveFromCart = (items: EcommerceItem[]) => {
  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  trackEvent("remove_from_cart", {
    currency: items[0]?.currency || "USD",
    value: totalValue,
    items,
  });
};

export const trackViewCart = (items: EcommerceItem[]) => {
  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  trackEvent("view_cart", {
    currency: items[0]?.currency || "USD",
    value: totalValue,
    items,
  });
};

export const trackBeginCheckout = (ecommerceData: EcommerceEvent) => {
  trackEvent("begin_checkout", {
    currency: ecommerceData.currency,
    value: ecommerceData.value,
    items: ecommerceData.items,
    coupon: ecommerceData.coupon,
  });
};

export const trackAddPaymentInfo = (
  ecommerceData: EcommerceEvent,
  payment_type: string
) => {
  trackEvent("add_payment_info", {
    currency: ecommerceData.currency,
    value: ecommerceData.value,
    payment_type,
    items: ecommerceData.items,
  });
};

export const trackPurchase = (ecommerceData: EcommerceEvent) => {
  if (!ecommerceData.transaction_id) {
    console.error("Transaction ID is required for purchase events");
    return;
  }

  trackEvent("purchase", {
    transaction_id: ecommerceData.transaction_id,
    currency: ecommerceData.currency,
    value: ecommerceData.value,
    items: ecommerceData.items,
    coupon: ecommerceData.coupon,
    shipping: ecommerceData.shipping || 0,
    tax: ecommerceData.tax || 0,
  });
};

export const trackRefund = (
  transaction_id: string,
  value?: number,
  currency: string = "USD",
  items?: EcommerceItem[]
) => {
  const parameters: Record<string, any> = {
    transaction_id,
    currency,
  };

  if (value !== undefined) {
    parameters.value = value;
  }

  if (items && items.length > 0) {
    parameters.items = items;
  }

  trackEvent("refund", parameters);
};

// Custom business events
export const trackSearch = (search_term: string, results_count?: number) => {
  trackEvent("search", {
    search_term,
    ...(results_count !== undefined && { results_count }),
  });
};

export const trackShare = (
  content_type: string,
  content_id: string,
  method?: string
) => {
  trackEvent("share", {
    content_type,
    content_id,
    ...(method && { method }),
  });
};

export const trackSignUp = (method?: string) => {
  trackEvent("sign_up", {
    ...(method && { method }),
  });
};

export const trackLogin = (method?: string) => {
  trackEvent("login", {
    ...(method && { method }),
  });
};

export const trackNewsletterSignup = (method: string = "email") => {
  trackEvent("newsletter_signup", {
    method,
    engagement_time_msec: Date.now(),
  });
};

// Scroll tracking
export const trackScroll = (percent: number) => {
  trackEvent("scroll", {
    percent_scrolled: percent,
  });
};

// File download tracking
export const trackFileDownload = (file_name: string, link_url: string) => {
  trackEvent("file_download", {
    file_name,
    link_url,
  });
};

// Video engagement tracking
export const trackVideoPlay = (
  video_title: string,
  video_duration?: number
) => {
  trackEvent("video_play", {
    video_title,
    ...(video_duration && { video_duration }),
  });
};

export const trackVideoProgress = (
  video_title: string,
  video_current_time: number,
  video_duration: number
) => {
  const progress_percentage = Math.round(
    (video_current_time / video_duration) * 100
  );

  trackEvent("video_progress", {
    video_title,
    video_current_time,
    video_duration,
    video_percent: progress_percentage,
  });
};

export const trackVideoComplete = (
  video_title: string,
  video_duration: number
) => {
  trackEvent("video_complete", {
    video_title,
    video_duration,
  });
};

// Enhanced ecommerce helper to create item objects from product data
export const createEcommerceItem = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  variant?: string;
  quantity?: number;
}): EcommerceItem => {
  return {
    item_id: product.id,
    item_name: product.name,
    category: product.category,
    brand: product.brand || "Verified Supplements",
    variant: product.variant,
    price: product.price,
    quantity: product.quantity || 1,
    currency: "USD",
  };
};

// Utility to generate transaction IDs
export const generateTransactionId = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
