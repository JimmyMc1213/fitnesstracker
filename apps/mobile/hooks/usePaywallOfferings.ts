import { useEffect, useState } from "react";

import { isRevenueCatConfigured, loadPaywallOfferings } from "@/lib/revenueCat";

type PaywallOfferingsState = {
  loading: boolean;
  ready: boolean;
  stub: boolean;
  error: string | null;
};

export function usePaywallOfferings(): PaywallOfferingsState {
  const [state, setState] = useState<PaywallOfferingsState>(() => ({
    loading: isRevenueCatConfigured(),
    ready: !isRevenueCatConfigured(),
    stub: !isRevenueCatConfigured(),
    error: null,
  }));

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
