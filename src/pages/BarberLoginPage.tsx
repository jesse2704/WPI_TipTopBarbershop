import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput } from "flowbite-react";
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

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-antique-gold mb-1">
            Barber Portal
          </h1>
          <p className="text-slate-grey text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-stark-white rounded-lg shadow-xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label
              htmlFor="username"
              className="text-deep-black font-heading mb-1"
            >
              Username
            </Label>
            <TextInput
              id="username"
              placeholder="Enter username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-deep-black font-heading mb-1"
            >
              Password
            </Label>
            <TextInput
              id="password"
              type="password"
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-antique-gold hover:bg-amber-600 text-deep-black font-heading border-0 focus:ring-antique-gold"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
