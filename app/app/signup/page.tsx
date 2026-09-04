"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Users, Loader2, Building2, User, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FREELANCER" | "AGENCY">("FREELANCER");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    const ok = await signup({
      name,
      email,
      password,
      role,
      agencyName: role === "AGENCY" ? agencyName : undefined,
    });
    setLoading(false);
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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Join hundreds of freelancers & agencies closing $1k–$5k client retainers.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5">
          {/* Account Type Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Select Workspace Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("FREELANCER")}
                className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  role === "FREELANCER"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${role === "FREELANCER" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <User className="h-4 w-4" />
                  </div>
                  {role === "FREELANCER" && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm">Freelancer / Solo</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Scrape, pitch & close 1-on-1 deals</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("AGENCY")}
                className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  role === "AGENCY"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${role === "AGENCY" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  {role === "AGENCY" && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm">Agency & Team</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Custom branding, CRM & bulk scale</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition"
              />
            </div>

            {role === "AGENCY" && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Agency / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Apex Growth Digital"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@growthstudio.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-medium gap-2 mt-3 shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating Account…
                </>
              ) : (
                <>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Free 14-day trial
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> No credit card needed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-500" /> Unlimited campaigns
          </span>
        </div>
      </div>
    </div>
  );
}
