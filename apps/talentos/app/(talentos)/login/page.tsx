"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

type Tab = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const signUpError = useMemo(() => {
    if (!signUp.email && !signUp.password && !signUp.confirmPassword) return "";
    if (signUp.password.length < 8) return "Password must be at least 8 characters.";
    if (signUp.password !== signUp.confirmPassword) return "Passwords do not match.";
    return "";
  }, [signUp]);

  async function handleSignIn() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signIn),
      });
      const json = (await res.json()) as { detail?: string };
      if (!res.ok) throw new Error(json.detail || "Unable to sign in");
      router.push("/workspace");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (signUpError) {
      setError(signUpError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUp.name,
          email: signUp.email,
          password: signUp.password,
        }),
      });
      const json = (await res.json()) as { detail?: string };
      if (!res.ok) throw new Error(json.detail || "Unable to create account");
      router.push("/workspace");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  function continueAsGuest() {
    const guestId = `guest_${Date.now()}`;
    localStorage.setItem("talentos_user_id", guestId);
    router.push("/workspace");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TalentOS</h1>
            <p className="text-zinc-500 text-sm">AI Career Intelligence</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-white/5 mb-5">
          <button
            onClick={() => { setTab("signin"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm ${tab === "signin" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm ${tab === "signup" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400"}`}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "signin" ? (
            <motion.div key="signin" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div className="space-y-3">
                <label className="text-sm text-zinc-300 block">
                  Email
                  <input aria-label="Email" value={signIn.email} onChange={(e) => setSignIn((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
                </label>
                <label className="text-sm text-zinc-300 block">
                  Password
                  <input aria-label="Password" type="password" value={signIn.password} onChange={(e) => setSignIn((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
                </label>
                <button aria-label="Sign In" onClick={() => { void handleSignIn(); }} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-50">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="signup" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
              <div className="space-y-3">
                <label className="text-sm text-zinc-300 block">
                  Name
                  <input aria-label="Name" value={signUp.name} onChange={(e) => setSignUp((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
                </label>
                <label className="text-sm text-zinc-300 block">
                  Email
                  <input aria-label="Email" value={signUp.email} onChange={(e) => setSignUp((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
                </label>
                <label className="text-sm text-zinc-300 block">
                  Password
                  <input aria-label="Create Password" type="password" value={signUp.password} onChange={(e) => setSignUp((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
                </label>
                <label className="text-sm text-zinc-300 block">
                  Confirm Password
                  <input aria-label="Confirm Password" type="password" value={signUp.confirmPassword} onChange={(e) => setSignUp((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm Password" className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
                </label>
                {signUpError ? <p className="text-red-300 text-sm">{signUpError}</p> : null}
                <button aria-label="Create Account" onClick={() => { void handleSignUp(); }} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-50">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? <p className="text-red-300 text-sm mt-3">{error}</p> : null}

        <div className="mt-6 text-center">
          <button aria-label="Continue as Guest" onClick={continueAsGuest} className="text-zinc-400 hover:text-white text-sm inline-flex items-center gap-1">
            Continue as Guest <ArrowRight size={14} />
          </button>
        </div>

        <div className="mt-4 text-center text-zinc-600 text-xs">
          By continuing, you agree to our terms.
        </div>
        <div className="mt-3 text-center">
          <Link href="/" className="text-cyan-300 text-sm hover:underline">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}
