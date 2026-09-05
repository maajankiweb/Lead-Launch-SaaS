"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Plus,
  Trash2,
  Download,
  Loader2,
  Search,
  MapPin,
  X,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { getPlanConfig } from "@/lib/plans";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  niche: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { leads: number };
}

interface CampaignManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCampaignId: string | null;
  onSelectCampaign: (campaignId: string) => void;
  onSaveCurrentAsCampaign: (title: string, niche: string, location: string) => Promise<void>;
  hasUnsavedLeads: boolean;
}

export function CampaignManagerModal({
  open,
  onOpenChange,
  currentCampaignId,
  onSelectCampaign,
  onSaveCurrentAsCampaign,
  hasUnsavedLeads,
}: CampaignManagerModalProps) {
  const { user } = useAuth();
  const planConfig = getPlanConfig(user?.plan);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNew, setSavingNew] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (res.ok && data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch {
      toast.error("Failed to load saved campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (campaigns.length >= planConfig.limits.maxCampaigns) {
      toast.error(
        `${planConfig.name} is limited to ${planConfig.limits.maxCampaigns} campaign. Upgrade to Freelancer Pro or Agency Scale for unlimited campaigns!`
      );
      return;
    }

    setSavingNew(true);
    try {
      await onSaveCurrentAsCampaign(title, niche, location);
      setShowNewForm(false);
      setTitle("");
      setNiche("");
      setLocation("");
      await fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to save campaign");
    } finally {
      setSavingNew(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this campaign? All saved leads in it will be removed.")) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Campaign deleted");
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch {
      toast.error("Error deleting campaign");
    }
  };

  const handleExportCsv = async (campaignId: string, campaignTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!planConfig.features.csvExport) {
      toast.error("CSV & Lead Export is available on Freelancer Pro and Agency Scale plans.");
      return;
    }

    try {
      setExportingId(campaignId);
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();

      if (!res.ok || !data.campaign?.leads) {
        toast.error("No leads available to export");
        return;
      }

      const leads = data.campaign.leads;
      const headers = ["Name", "Category", "Address", "Phone", "Website", "Rating", "Reviews", "Opportunity Score", "Notes"];
      const rows = leads.map((l: any) => [
        `"${(l.name || "").replace(/"/g, '""')}"`,
        `"${(l.category || "").replace(/"/g, '""')}"`,
        `"${(l.address || "").replace(/"/g, '""')}"`,
        `"${(l.phone || "").replace(/"/g, '""')}"`,
        `"${(l.website || "").replace(/"/g, '""')}"`,
        l.rating || "",
        l.reviews || "",
        l.opportunityScore || "",
        `"${(l.opportunityNotes || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${campaignTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_leads.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${leads.length} leads to CSV!`);
    } catch {
      toast.error("Failed to generate CSV export");
    } finally {
      setExportingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Saved Campaigns & Pipelines</h2>
                <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {planConfig.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Capacity: {campaigns.length} / {planConfig.limits.maxCampaigns === Infinity ? "Unlimited" : planConfig.limits.maxCampaigns} campaigns
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Action buttons / New Form */}
          {!showNewForm ? (
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/80">
              <div>
                <div className="text-xs font-semibold">
                  {hasUnsavedLeads ? "💾 Save current leads as a new campaign" : "Create a new campaign container"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Store leads and audits permanently in your cloud MongoDB database
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (campaigns.length >= planConfig.limits.maxCampaigns) {
                    toast.error(
                      `Free plan is limited to 1 campaign. Upgrade to Freelancer Pro or Agency Scale for unlimited pipelines!`
                    );
                    return;
                  }
                  setShowNewForm(true);
                }}
                className="h-8 text-xs gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> New Campaign
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-xl bg-muted/40 border border-primary/30 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-primary">Save New Campaign</span>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Campaign Title (e.g. Austin Roofers & Remodelers)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Niche (e.g. Roofing)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Region (e.g. Austin, TX)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingNew}
                  className="h-8 text-xs gap-1.5"
                >
                  {savingNew ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Save to Database
                </Button>
              </div>
            </form>
          )}

          {/* List of campaigns */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Your Campaigns ({campaigns.length})
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Loading database records…</span>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                No saved campaigns found. Create your first campaign above to store client leads!
              </div>
            ) : (
              <div className="space-y-2.5">
                {campaigns.map((camp) => {
                  const isSelected = currentCampaignId === camp.id;
                  return (
                    <div
                      key={camp.id}
                      onClick={() => {
                        onSelectCampaign(camp.id);
                        onOpenChange(false);
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-border/80 bg-background/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{camp.title}</span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary font-bold rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {camp.niche && (
                            <span className="inline-flex items-center gap-1">
                              <Search className="h-3 w-3" /> {camp.niche}
                            </span>
                          )}
                          {camp.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {camp.location}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-primary font-medium">
                            {camp._count?.leads ?? 0} leads
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* CSV Export Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleExportCsv(camp.id, camp.title, e)}
                          disabled={exportingId === camp.id}
                          title={planConfig.features.csvExport ? "Export Leads to CSV" : "CSV Export (Pro & Agency Plan)"}
                          className="h-8 text-xs gap-1 border-border hover:bg-muted"
                        >
                          {exportingId === camp.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : planConfig.features.csvExport ? (
                            <Download className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          CSV
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(camp.id, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
