import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
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
  /** True while popup sign-in is in progress */
  busy: boolean;
  /** Sign in using Google */
  signInWithGoogle: () => Promise<void>;
  /** Sign in using Apple */
  signInWithApple: () => Promise<void>;
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

  /* Listen for auth state changes (persists across refreshes) */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err?.message ?? "Apple sign-in failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <PhoneAuthContext.Provider
      value={{ user, loading, error, busy, signInWithGoogle, signInWithApple, logout }}
    >
      {children}
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
