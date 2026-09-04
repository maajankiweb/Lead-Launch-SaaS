"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { getPlanConfig } from "@/lib/plans";
import {
  Settings,
  User,
  Building2,
  Key,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface UserSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSettingsModal({ open, onOpenChange }: UserSettingsModalProps) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [apiKeyClaude, setApiKeyClaude] = useState("");
  const [apiKeyOpenAI, setApiKeyOpenAI] = useState("");
  const [plan, setPlan] = useState<string>("FREE");

  const currentPlanConfig = getPlanConfig(plan);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/user/settings")
        .then((r) => r.json())
        .then((d) => {
          if (d.user) {
            setName(d.user.name || "");
            setAgencyName(d.user.agencyName || "");
            setApiKeyClaude(d.user.apiKeyClaude || "");
            setApiKeyOpenAI(d.user.apiKeyOpenAI || "");
            setPlan(d.user.plan || "FREE");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          agencyName,
          apiKeyClaude,
          apiKeyOpenAI,
          plan,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Settings saved! Active plan: ${getPlanConfig(plan).name}`);
        await refreshUser();
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Workspace & SaaS Tier Settings</h2>
              <p className="text-xs text-muted-foreground">Manage profile, agency branding, AI keys, and tier upgrades</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading profile settings…</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
            {/* Plan Tier Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Active Subscription Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlan("FREE")}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    plan === "FREE"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-border/80 bg-background/50"
                  }`}
                >
                  <div className="font-bold text-xs">Starter Free</div>
                  <div className="text-[10px] text-muted-foreground">$0 / forever</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan("PRO")}
                  className={`p-2.5 rounded-xl border text-left transition relative ${
                    plan === "PRO"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-border/80 bg-background/50"
                  }`}
                >
                  <div className="font-bold text-xs text-primary">Freelancer Pro</div>
                  <div className="text-[10px] text-muted-foreground">$29 / month</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan("AGENCY_SCALE")}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    plan === "AGENCY_SCALE" || plan === "AGENCY"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-border/80 bg-background/50"
                  }`}
                >
                  <div className="font-bold text-xs text-primary">Agency Scale</div>
                  <div className="text-[10px] text-muted-foreground">$99 / month</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  Custom Agency / Studio Name (White-Label)
                </label>
                {currentPlanConfig.features.customAgencyBranding ? (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Agency Scale Plan Feature
                  </span>
                )}
              </div>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. MaaJanki Digital Agency"
                disabled={!currentPlanConfig.features.customAgencyBranding && plan === "FREE"}
                className={`w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background ${
                  !currentPlanConfig.features.customAgencyBranding && plan === "FREE" ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Appears on client audit reports, PDF headers, and cold outreach signatures.
              </p>
            </div>

            <div className="pt-2 border-t border-border/80">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" /> Custom AI Keys (Claude & OpenAI)
                </span>
                {currentPlanConfig.features.customApiKeys ? (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Unlocked (Pro / Agency)
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Freelancer Pro & Agency Feature
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Anthropic Claude API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKeyClaude}
                    onChange={(e) => setApiKeyClaude(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Allows unlimited AI website redesign generation on cloud.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKeyOpenAI}
                    onChange={(e) => setApiKeyOpenAI(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-9 text-xs gap-1.5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
