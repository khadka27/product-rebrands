"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";
import { generateTransactionId } from "@/lib/analytics";

interface PurchaseTrackingProps {
  children: React.ReactNode;
}

export function PurchaseTracking({ children }: PurchaseTrackingProps) {
  const { trackPurchaseEvent, trackCustomEvent } = useAnalytics();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is a successful purchase completion
    const isSuccess = searchParams.get("success") === "true";
    const orderId = searchParams.get("order_id");
    const amount = searchParams.get("amount");
    const products = searchParams.get("products");

    if (isSuccess && orderId && amount) {
      try {
        const parsedProducts = products
          ? JSON.parse(decodeURIComponent(products))
          : [];
        const totalAmount = parseFloat(amount);

        // Track the purchase
        trackPurchaseEvent(
          orderId,
          parsedProducts,
          totalAmount,
          "USD",
          0, // shipping
          0, // tax
          undefined // coupon
        );

        // Track custom success event
        trackCustomEvent("purchase_completed", {
          transaction_id: orderId,
          value: totalAmount,
          currency: "USD",
          payment_method: "credit_card", // You could get this from params too
          customer_type: "new_customer", // You could determine this from user data
        });

        console.log("Purchase tracked successfully:", {
          orderId,
          amount: totalAmount,
          products: parsedProducts,
        });
      } catch (error) {
        console.error("Error tracking purchase:", error);
      }
    }
  }, [searchParams, trackPurchaseEvent, trackCustomEvent]);

  return <>{children}</>;
}

// Example usage component for checkout pages
export function CheckoutAnalytics() {
  const { trackCheckoutBegin, trackCustomEvent } = useAnalytics();

  const handleBeginCheckout = (cartItems: any[], totalValue: number) => {
    trackCheckoutBegin(cartItems, totalValue);
  };

  const handlePaymentMethodSelection = (method: string) => {
    trackCustomEvent("add_payment_info", {
      payment_type: method,
      engagement_time_msec: Date.now(),
    });
  };

  const handleCheckoutStep = (step: number, stepName: string) => {
    trackCustomEvent("checkout_progress", {
      checkout_step: step,
      checkout_option: stepName,
    });
  };

  return {
    handleBeginCheckout,
    handlePaymentMethodSelection,
    handleCheckoutStep,
  };
}

// Example search tracking component
export function SearchTracking() {
  const { trackSearchEvent } = useAnalytics();

  const handleSearch = (query: string, resultsCount?: number) => {
    if (query.trim()) {
      trackSearchEvent(query.trim(), resultsCount);
    }
  };

  return { handleSearch };
}
