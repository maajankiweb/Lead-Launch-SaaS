"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (ok) {
      router.push("/dashboard");
    }
  };

  const handleDemo = async (role: "FREELANCER" | "AGENCY") => {
    setDemoLoading(true);
    const ok = await demoLogin(role);
    setDemoLoading(false);
    if (ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-muted/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Lead <span className="text-muted-foreground">→</span> Launch</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Account Sign In
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in with your registered Freelancer or Agency credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agency.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full h-11 text-sm font-medium gap-2 mt-2 shadow-md shadow-primary/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="text-[11px] text-center text-muted-foreground uppercase tracking-wider font-semibold mb-2.5">
              Or Try Instant Live Demo
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || demoLoading}
                onClick={() => handleDemo("FREELANCER")}
                className="text-xs h-9 border-primary/30 text-foreground hover:bg-primary/10"
              >
                Freelancer Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || demoLoading}
                onClick={() => handleDemo("AGENCY")}
                className="text-xs h-9 border-primary/30 text-foreground hover:bg-primary/10"
              >
                Agency Demo
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground border-t border-border/60 pt-4">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create a free account
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Cloud Database
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Multi-Tenant Workspace
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-500" /> Agency CRM Pipeline
          </span>
        </div>
      </div>
    </div>
  );
}
