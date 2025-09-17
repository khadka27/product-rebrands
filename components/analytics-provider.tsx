"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import {
  ConsentBanner,
  type ConsentPreferences,
  hasConsentFor,
} from "@/components/consent-banner";
import { useEffect, useState } from "react";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial consent status
    const hasAnalyticsConsent = hasConsentFor("analytics");
    setAnalyticsEnabled(hasAnalyticsConsent);
  }, []);

  const handleConsentUpdate = (preferences: ConsentPreferences) => {
    setAnalyticsEnabled(preferences.analytics);

    // If analytics was just enabled, we need to reload to initialize GA
    if (preferences.analytics && !analyticsEnabled) {
      window.location.reload();
    }
  };

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Only load Google Analytics if consent is given and GA ID is available */}
      {analyticsEnabled && gaId && <GoogleAnalytics gaId={gaId} />}

      {/* Consent banner will only show if consent hasn't been given */}
      <ConsentBanner onConsentUpdate={handleConsentUpdate} />

      {children}
    </>
  );
}
