import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "luxpdf_subscription";

export interface SubscriptionData {
  email: string;
  trialStartedAt: number;
  trialEndsAt: number;
  status: "trialing" | "active" | "canceled";
}

interface PremiumContextType {
  subscription: SubscriptionData | null;
  isPremium: boolean;
  isTrialing: boolean;
  daysLeftInTrial: number;
  startTrial: (email: string) => void;
  cancelTrial: () => void;
  restoreAccess: (email: string) => boolean;
}

const PremiumContext = createContext<PremiumContextType>({
  subscription: null,
  isPremium: false,
  isTrialing: false,
  daysLeftInTrial: 0,
  startTrial: () => {},
  cancelTrial: () => {},
  restoreAccess: () => false,
});

function loadSubscription(): SubscriptionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubscriptionData;
  } catch {
    return null;
  }
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    loadSubscription,
  );

  // Re-check every minute so expiry is reflected without reload
  useEffect(() => {
    const id = setInterval(() => {
      setSubscription(loadSubscription());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const isTrialing =
    subscription?.status === "trialing" &&
    (subscription?.trialEndsAt ?? 0) > Date.now();
  const isPremium = isTrialing || subscription?.status === "active";
  const daysLeftInTrial = isTrialing
    ? Math.max(
        0,
        Math.ceil(
          ((subscription?.trialEndsAt ?? 0) - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const startTrial = useCallback((email: string) => {
    const now = Date.now();
    const data: SubscriptionData = {
      email,
      trialStartedAt: now,
      trialEndsAt: now + 7 * 24 * 60 * 60 * 1000,
      status: "trialing",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSubscription(data);
  }, []);

  const cancelTrial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSubscription(null);
  }, []);

  const restoreAccess = useCallback((email: string): boolean => {
    const stored = loadSubscription();
    if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
      setSubscription(stored);
      return true;
    }
    return false;
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        subscription,
        isPremium,
        isTrialing,
        daysLeftInTrial,
        startTrial,
        cancelTrial,
        restoreAccess,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
