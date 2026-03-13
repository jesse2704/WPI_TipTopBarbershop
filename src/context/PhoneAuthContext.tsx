import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

/* ── Types ─────────────────────────────────────────────────── */

interface PhoneAuthContextType {
  /** Currently signed-in Firebase user (null when logged out) */
  user: User | null;
  /** True while we check the initial auth state */
  loading: boolean;
  /** Human-readable error message (cleared on next action) */
  error: string | null;
  /** True while waiting for SMS or verification */
  busy: boolean;
  /** Step 1 — send a verification code to the phone number */
  sendCode: (phoneNumber: string) => Promise<void>;
  /** Step 2 — verify the 6-digit code received via SMS */
  verifyCode: (code: string) => Promise<void>;
  /** Sign out */
  logout: () => Promise<void>;
}

const PhoneAuthContext = createContext<PhoneAuthContextType | undefined>(
  undefined
);

/* ── Provider ──────────────────────────────────────────────── */

export function PhoneAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  /* Listen for auth state changes (persists across refreshes) */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /* Invisible reCAPTCHA setup (required by Firebase Phone Auth) */
  const getRecaptchaVerifier = useCallback(() => {
    // Re-use existing or create a new invisible reCAPTCHA
    if (!(window as any).__recaptchaVerifier) {
      (window as any).__recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
    return (window as any).__recaptchaVerifier as RecaptchaVerifier;
  }, []);

  /* Step 1 — send verification SMS */
  const sendCode = useCallback(
    async (phoneNumber: string) => {
      setError(null);
      setBusy(true);
      try {
        const verifier = getRecaptchaVerifier();
        const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        setConfirmationResult(result);
      } catch (err: any) {
        // Reset reCAPTCHA so it can be retried
        (window as any).__recaptchaVerifier = undefined;
        setError(
          err?.message?.includes("auth/invalid-phone-number")
            ? "Invalid phone number. Use international format, e.g. +31612345678."
            : err?.message ?? "Failed to send verification code."
        );
      } finally {
        setBusy(false);
      }
    },
    [getRecaptchaVerifier]
  );

  /* Step 2 — verify the SMS code */
  const verifyCode = useCallback(
    async (code: string) => {
      if (!confirmationResult) {
        setError("No verification in progress. Please request a new code.");
        return;
      }
      setError(null);
      setBusy(true);
      try {
        await confirmationResult.confirm(code);
        // onAuthStateChanged will fire and set `user`
      } catch (err: any) {
        setError(
          err?.message?.includes("auth/invalid-verification-code")
            ? "Invalid code. Please try again."
            : err?.message ?? "Verification failed."
        );
      } finally {
        setBusy(false);
      }
    },
    [confirmationResult]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setConfirmationResult(null);
  }, []);

  return (
    <PhoneAuthContext.Provider
      value={{ user, loading, error, busy, sendCode, verifyCode, logout }}
    >
      {children}
      {/* Invisible reCAPTCHA mount point — required by Firebase */}
      <div id="recaptcha-container" />
    </PhoneAuthContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────────── */

export function usePhoneAuth(): PhoneAuthContextType {
  const ctx = useContext(PhoneAuthContext);
  if (!ctx) {
    throw new Error("usePhoneAuth must be used within a PhoneAuthProvider");
  }
  return ctx;
}
