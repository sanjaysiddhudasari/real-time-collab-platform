import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-enter">
        <div className="surface rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-zinc-500 text-xs font-medium tracking-widest uppercase">CodeSync</span>
          </div>
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Reset password</h1>
          <p className="text-zinc-500 text-xs mt-1 mb-5 leading-relaxed">
            {sent ? "Check your inbox for a reset link." : "Enter your account email and we'll send a reset link."}
          </p>
          {sent ? (
            <button
              onClick={() => navigate("/login")}
              className="btn-press w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold rounded-md transition-colors cursor-pointer"
            >
              Back to sign in
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSent(true);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field w-full bg-black/30 border border-white/[0.07] rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none"
              />
              <button
                type="submit"
                className="btn-press w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold rounded-md transition-colors cursor-pointer"
              >
                Send reset link
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn-press w-full py-2 text-zinc-500 hover:text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
