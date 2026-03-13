import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BarberLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate("/barber/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-slate-grey/30 bg-stark-white text-deep-black placeholder-slate-grey/50 focus:outline-none focus:ring-2 focus:ring-antique-gold focus:border-antique-gold transition-colors";

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-antique-gold tracking-[0.3em] uppercase text-xs mb-3 font-heading">
            Staff Access
          </p>
          <h1 className="text-3xl font-bold text-vintage-cream font-heading mb-2">
            Barber Portal
          </h1>
          <p className="text-vintage-cream/40 text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-stark-white rounded-xl shadow-2xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="username" className="block text-sm font-heading font-semibold text-deep-black">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-heading font-semibold text-deep-black">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-antique-gold hover:bg-amber-500 text-deep-black font-heading font-bold rounded-lg transition-colors shadow-md mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
