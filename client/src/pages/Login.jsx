import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", formData);
      console.log(response.data);
      localStorage.setItem("user",JSON.stringify(response.data.user));
      navigate("/");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-zinc-700";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-2xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Card */}
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/60 rounded-2xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-[10px] bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-zinc-500 text-xs font-medium tracking-widest uppercase">Realtime Platform</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">Sign in to continue collaborating in real time</p>
          </div>

          {/* Social buttons */}
          <div className="flex gap-2.5 mb-6">
            <button
              onClick={()=>window.location.href=`http://${window.location.hostname}:5000/api/auth/google`}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-sm font-medium transition duration-200 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-sm font-medium transition duration-200 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-700 text-xs font-medium tracking-widest">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              <svg className="text-red-400 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* username */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username </label>
              <div className="relative">
                <svg
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 `}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  placeholder="Tony Stark"
                  className={inputBase}
                  value={formData.username}
                  onChange={handleChange("username")}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400">Password</label>
                <span
                  className="text-xs text-blue-500 hover:text-blue-400 cursor-pointer transition-colors"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`${inputBase} pr-11`}
                  value={formData.password}
                  onChange={handleChange("password")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors duration-150 p-0.5"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-600 shrink-0"
              />
              <span className="text-zinc-500 text-xs">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.4)] active:translate-y-0 flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <span
              className="text-blue-500 hover:text-blue-400 cursor-pointer font-medium transition-colors"
              onClick={() => navigate("/register")}
            >
              Create one free
            </span>
          </p>
        </div>

        {/* SSL badge */}
        <p className="flex items-center justify-center gap-1.5 mt-4 text-xs text-zinc-700">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}