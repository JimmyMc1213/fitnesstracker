import { useEffect, useState } from "react";

import { isRevenueCatConfigured, loadPaywallOfferings } from "@/lib/revenueCat";
import { PAYWALL_STORE_SETUP_MESSAGE } from "@/lib/revenueCatMessages";

type PaywallOfferingsState = {
  loading: boolean;
  ready: boolean;
  stub: boolean;
  error: string | null;
};

export function usePaywallOfferings(): PaywallOfferingsState {
  const [state, setState] = useState<PaywallOfferingsState>(() => {
    if (!isRevenueCatConfigured()) {
      const stub = typeof __DEV__ !== "undefined" && __DEV__;
      return {
        loading: false,
        ready: stub,
        stub,
        error: stub ? null : PAYWALL_STORE_SETUP_MESSAGE,
      };
    }

    return {
      loading: true,
      ready: false,
      stub: false,
      error: null,
    };
  });

  useEffect(() => {
    if (!isRevenueCatConfigured()) return;

    let cancelled = false;

    void loadPaywallOfferings().then((result) => {
      if (cancelled) return;

      if (result.ok) {
        setState({
          loading: false,
          ready: true,
          stub: result.stub,
          error: null,
        });
        return;
      }

      setState({
        loading: false,
        ready: false,
        stub: result.stub,
        error: result.error,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
