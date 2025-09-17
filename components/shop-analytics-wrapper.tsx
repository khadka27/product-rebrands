"use client";

import { useEffect } from "react";
import {
  useAnalytics,
  usePageTracking,
  useScrollTracking,
} from "@/hooks/use-analytics";

interface ShopAnalyticsWrapperProps {
  children: React.ReactNode;
  products: Array<{
    id: string;
    name: string;
    price: string;
    category: string;
  }>;
}

export function ShopAnalyticsWrapper({
  children,
  products,
}: ShopAnalyticsWrapperProps) {
  const { trackCustomEvent } = useAnalytics();

  // Track page views and scroll depth
  usePageTracking();
  useScrollTracking();

  useEffect(() => {
    // Track that user viewed the shop page with product list
    const productItems = products.map((product) => ({
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      quantity: 1,
    }));

    trackCustomEvent("view_item_list", {
      currency: "USD",
      value: productItems.reduce((sum, item) => sum + item.price, 0),
      items: productItems,
      item_list_name: "Shop Page Products",
    });
  }, [products, trackCustomEvent]);

  return <>{children}</>;
}
