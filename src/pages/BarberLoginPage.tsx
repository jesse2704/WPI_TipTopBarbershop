import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const headingFont = { fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif" };
const accentFont = { fontFamily: "'Lora', serif" };

export default function BarberLoginPage() {
  const { isAuthenticated, loading, error, signInWithGoogle, signInWithApple } = useAuth();
  const { txt } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/barber/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-vintage-cream px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-antique-gold/25 bg-deep-black px-6 py-7 shadow-xl md:px-8 md:py-8">
          <div className="absolute -top-12 -right-16 h-44 w-44 rounded-full bg-antique-gold/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-[10px] tracking-[0.45em] uppercase text-antique-gold" style={accentFont}>
              {txt("Toegang Voor Personeel", "Staff Access")}
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black text-vintage-cream leading-[0.9]" style={headingFont}>
              {txt("Barbier Portaal", "Barber Portal")}
            </h1>
            <p className="mt-2 text-sm text-vintage-cream/65" style={accentFont}>
              {txt("Log in met je account om de planning te beheren.", "Sign in with your account to manage the daily schedule.")}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-lg rounded-2xl border border-slate-grey/15 bg-stark-white p-8 shadow-lg space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-deep-black font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            style={headingFont}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {txt("Doorgaan met Google", "Continue with Google")}
          </button>

          {/* Apple Sign-In */}
          <button
            onClick={signInWithApple}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-deep-black hover:bg-black text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            style={headingFont}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            {txt("Doorgaan met Apple", "Continue with Apple")}
          </button>
        </div>
      </div>
    </div>
  );
}
