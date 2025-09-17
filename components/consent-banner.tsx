"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentBannerProps {
  onConsentUpdate?: (preferences: ConsentPreferences) => void;
}

const CONSENT_KEY = "cookie-consent";
const CONSENT_PREFERENCES_KEY = "consent-preferences";

export function ConsentBanner({ onConsentUpdate }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a consent choice
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(CONSENT_PREFERENCES_KEY);
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        onConsentUpdate?.(parsed);
      }
    }
  }, [onConsentUpdate]);

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsentPreferences(allAccepted);
  };

  const handleAcceptSelected = () => {
    saveConsentPreferences(preferences);
  };

  const handleRejectAll = () => {
    const minimal: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsentPreferences(minimal);
  };

  const saveConsentPreferences = (prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_KEY, "true");
    localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    onConsentUpdate?.(prefs);
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === "necessary") return; // Can't disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Cookie Preferences</CardTitle>
              <CardDescription>
                We use cookies to enhance your browsing experience and analyze
                our traffic.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRejectAll()}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!showDetails ? (
            <p className="text-sm text-muted-foreground">
              We use cookies to improve your experience on our site. By
              accepting all cookies, you help us analyze site usage and provide
              better services.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="necessary"
                  checked={preferences.necessary}
                  disabled
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="necessary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Necessary Cookies
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Required for the website to function properly. Cannot be
                    disabled.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    updatePreference("analytics", checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="analytics"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Analytics Cookies
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Help us understand how visitors interact with our website by
                    collecting anonymous information.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    updatePreference("marketing", checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="marketing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Marketing Cookies
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Used to deliver personalized advertisements and track
                    advertising effectiveness.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {!showDetails ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button onClick={handleAcceptAll} className="flex-1">
                Accept All Cookies
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1"
              >
                Reject All
              </Button>
              <Button
                onClick={() => setShowDetails(true)}
                variant="ghost"
                className="flex-1"
              >
                Customize
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button onClick={handleAcceptSelected} className="flex-1">
                Save Preferences
              </Button>
              <Button
                onClick={() => setShowDetails(false)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Utility functions for other components to use
export const getConsentPreferences = (): ConsentPreferences | null => {
  if (typeof window === "undefined") return null;

  const consent = localStorage.getItem(CONSENT_KEY);
  if (!consent) return null;

  const preferences = localStorage.getItem(CONSENT_PREFERENCES_KEY);
  return preferences ? JSON.parse(preferences) : null;
};

export const hasConsentFor = (type: keyof ConsentPreferences): boolean => {
  const preferences = getConsentPreferences();
  return preferences ? preferences[type] : false;
};

export const clearConsent = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(CONSENT_PREFERENCES_KEY);
};
