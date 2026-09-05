import mongoose, { Schema, model, models } from "mongoose";

const FALLBACK_MONGODB_URI =
  "mongodb+srv://maajankiweb_db_user:sHc35Zgh6CApQAS3@cluster0.772mcnf.mongodb.net/lead_to_launch?retryWrites=true&w=majority&appName=Cluster0";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  FALLBACK_MONGODB_URI;

// Global cached connection for Next.js hot-reloading & serverless
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

function generateId(): string {
  return "c" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// 1. User Schema
const UserSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "FREELANCER" },
    plan: { type: String, default: "FREE" },
    planUpdatedAt: { type: Date, default: null },
    agencyName: { type: String, default: null },
    agencyLogo: { type: String, default: null },
    apiKeyClaude: { type: String, default: null },
    apiKeyOpenAI: { type: String, default: null },
    apiKeyGoogle: { type: String, default: null },
    vercelToken: { type: String, default: null },
  },
  { timestamps: true }
);

// 2. Campaign Schema
const CampaignSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    niche: { type: String, default: "General" },
    location: { type: String, default: "Worldwide" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

// 3. Lead Schema
const LeadSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true, index: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: null },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    website: { type: String, default: null },
    rating: { type: Number, default: null },
    reviews: { type: Number, default: null },
    email: { type: String, default: null },
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },
    linkedin: { type: String, default: null },
    status: { type: String, default: "new" },
    opportunityScore: { type: Number, default: null },
    opportunityNotes: { type: String, default: null },
  },
  { timestamps: true }
);

// 4. Audit Schema
const AuditSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true },
    leadId: { type: String, required: true, unique: true, index: true },
    score: { type: Number, default: 0 },
    desktopSpeed: { type: Number, default: 0 },
    mobileSpeed: { type: Number, default: 0 },
    seoScore: { type: Number, default: 0 },
    ssl: { type: Boolean, default: false },
    mobileFriendly: { type: Boolean, default: false },
    cmsDetected: { type: String, default: null },
    issues: { type: String, default: "[]" },
    improvements: { type: String, default: "[]" },
    techStack: { type: String, default: "[]" },
  },
  { timestamps: true }
);

// 5. Pitch Schema
const PitchSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true },
    leadId: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    emailBody: { type: String, required: true },
    dmScript: { type: String, required: true },
    callScript: { type: String, default: null },
    valueProposition: { type: String, default: "" },
    pricingSuggestion: { type: String, default: "" },
  },
  { timestamps: true }
);

// 6. Deal Schema
const DealSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    leadId: { type: String, default: null },
    clientName: { type: String, required: true },
    company: { type: String, required: true },
    service: { type: String, default: "Website Redesign & SEO" },
    value: { type: Number, default: 1500 },
    stage: { type: String, default: "lead" },
    notes: { type: String, default: null },
    targetDate: { type: String, default: null },
  },
  { timestamps: true }
);

// 7. Payment Schema
const PaymentSchema = new Schema(
  {
    id: { type: String, default: generateId, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, default: "" },
    userName: { type: String, default: "" },
    plan: { type: String, required: true }, // "PRO" | "AGENCY_SCALE"
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" }, // "USD" | "INR"
    provider: { type: String, default: "stripe" }, // "stripe" | "razorpay" | "demo_instant"
    transactionId: { type: String, default: null },
    status: { type: String, default: "completed" }, // "completed" | "pending" | "failed"
  },
  { timestamps: true }
);

// Mongoose Models
export const User = models.User || model("User", UserSchema);
export const Campaign = models.Campaign || model("Campaign", CampaignSchema);
export const Lead = models.Lead || model("Lead", LeadSchema);
export const Audit = models.Audit || model("Audit", AuditSchema);
export const Pitch = models.Pitch || model("Pitch", PitchSchema);
export const Deal = models.Deal || model("Deal", DealSchema);
export const Payment = models.Payment || model("Payment", PaymentSchema);

// MongoDB Atlas Database Adapter Interface
export const db = {
  user: {
    async findUnique({ where }: { where: { id?: string; email?: string }; select?: any }) {
      await connectDB();
      const query: any = {};
      if (where.id) query.id = where.id;
      if (where.email) query.email = where.email.toLowerCase();
      const doc = await User.findOne(query).lean();
      return doc ? { ...doc, id: doc.id || doc._id?.toString() } : null;
    },

    async findMany() {
      await connectDB();
      const docs = await User.find({}).lean();
      return docs.map((d: any) => ({ ...d, id: d.id || d._id?.toString() }));
    },

    async create({ data }: { data: any }) {
      await connectDB();
      const id = data.id || generateId();
      const user = await User.create({
        ...data,
        id,
      });
      return { ...user.toObject(), id: user.id || user._id.toString() };
    },

    async update({ where, data }: { where: { id: string }; data: any; select?: any }) {
      await connectDB();
      const user = await User.findOneAndUpdate({ id: where.id }, { $set: data }, { new: true }).lean();
      if (!user) throw new Error("User not found");
      return { ...user, id: user.id || user._id.toString() };
    },
  },

  campaign: {
    async findMany({
      where,
      include,
      orderBy,
    }: {
      where?: { userId?: string };
      include?: any;
      orderBy?: { updatedAt?: "asc" | "desc" };
    }) {
      await connectDB();
      const query: any = {};
      if (where?.userId) query.userId = where.userId;

      const sortQuery: any = {};
      if (orderBy?.updatedAt === "desc") sortQuery.updatedAt = -1;
      else sortQuery.updatedAt = 1;

      const campaigns = await Campaign.find(query).sort(sortQuery).lean();

      if (include?._count) {
        const campaignIds = campaigns.map((c: any) => c.id);
        const leadCounts = await Lead.aggregate([
          { $match: { campaignId: { $in: campaignIds } } },
          { $group: { _id: "$campaignId", count: { $sum: 1 } } },
        ]);

        const countMap = new Map(leadCounts.map((item) => [item._id, item.count]));

        return campaigns.map((c: any) => ({
          ...c,
          id: c.id || c._id?.toString(),
          _count: {
            leads: countMap.get(c.id) || 0,
          },
        }));
      }

      if (include?.leads) {
        const campaignIds = campaigns.map((c: any) => c.id);
        const leads = await Lead.find({ campaignId: { $in: campaignIds } }).lean();

        return campaigns.map((c: any) => ({
          ...c,
          id: c.id || c._id?.toString(),
          leads: leads
            .filter((l: any) => l.campaignId === c.id)
            .map((l: any) => ({ ...l, id: l.id || l._id?.toString() })),
        }));
      }

      return campaigns.map((c: any) => ({ ...c, id: c.id || c._id?.toString() }));
    },

    async findFirst({
      where,
      include,
    }: {
      where: { id?: string; userId?: string };
      include?: any;
    }) {
      await connectDB();
      const query: any = {};
      if (where.id) query.id = where.id;
      if (where.userId) query.userId = where.userId;

      const campaign = await Campaign.findOne(query).lean();
      if (!campaign) return null;

      const campObj: any = { ...campaign, id: campaign.id || campaign._id?.toString() };

      if (include?.leads) {
        const leads = await Lead.find({ campaignId: campObj.id }).lean();
        const leadIds = leads.map((l: any) => l.id);

        const audits = include.leads?.include?.audit
          ? await Audit.find({ leadId: { $in: leadIds } }).lean()
          : [];
        const pitches = include.leads?.include?.pitch
          ? await Pitch.find({ leadId: { $in: leadIds } }).lean()
          : [];

        const auditMap = new Map(audits.map((a: any) => [a.leadId, a]));
        const pitchMap = new Map(pitches.map((p: any) => [p.leadId, p]));

        campObj.leads = leads.map((l: any) => ({
          ...l,
          id: l.id || l._id?.toString(),
          audit: auditMap.get(l.id) || null,
          pitch: pitchMap.get(l.id) || null,
        }));
      }

      return campObj;
    },

    async findUnique({ where, include }: { where: { id: string }; include?: any }) {
      return this.findFirst({ where, include });
    },

    async create({ data }: { data: any }) {
      await connectDB();
      const id = data.id || generateId();
      const campaign = await Campaign.create({
        ...data,
        id,
      });
      return { ...campaign.toObject(), id: campaign.id || campaign._id.toString() };
    },

    async deleteMany({ where }: { where: { id?: string; userId?: string } }) {
      await connectDB();
      const query: any = {};
      if (where.id) query.id = where.id;
      if (where.userId) query.userId = where.userId;

      const campaigns = await Campaign.find(query).lean();
      const campaignIds = campaigns.map((c: any) => c.id);

      const res = await Campaign.deleteMany(query);

      if (campaignIds.length > 0) {
        const leads = await Lead.find({ campaignId: { $in: campaignIds } }).lean();
        const leadIds = leads.map((l: any) => l.id);

        await Lead.deleteMany({ campaignId: { $in: campaignIds } });
        if (leadIds.length > 0) {
          await Audit.deleteMany({ leadId: { $in: leadIds } });
          await Pitch.deleteMany({ leadId: { $in: leadIds } });
        }
      }

      return { count: res.deletedCount };
    },
  },

  lead: {
    async create({ data }: { data: any }) {
      await connectDB();
      const id = data.id || generateId();
      const lead = await Lead.create({ ...data, id });
      return { ...lead.toObject(), id: lead.id || lead._id.toString() };
    },

    async createMany({ data }: { data: Array<any> }) {
      await connectDB();
      const formatted = data.map((d) => ({
        ...d,
        id: d.id || generateId(),
      }));
      const res = await Lead.insertMany(formatted);
      return { count: res.length };
    },

    async findMany({ where }: { where?: { campaignId?: string } }) {
      await connectDB();
      const query: any = {};
      if (where?.campaignId) query.campaignId = where.campaignId;
      const docs = await Lead.find(query).lean();
      return docs.map((d: any) => ({ ...d, id: d.id || d._id?.toString() }));
    },
  },

  deal: {
    async findMany({
      where,
      orderBy,
    }: {
      where?: { userId?: string };
      orderBy?: { updatedAt?: "asc" | "desc" };
    }) {
      await connectDB();
      const query: any = {};
      if (where?.userId) query.userId = where.userId;

      const sortQuery: any = {};
      if (orderBy?.updatedAt === "desc") sortQuery.updatedAt = -1;
      else sortQuery.updatedAt = 1;

      const docs = await Deal.find(query).sort(sortQuery).lean();
      return docs.map((d: any) => ({ ...d, id: d.id || d._id?.toString() }));
    },

    async findFirst({ where }: { where: { id?: string; userId?: string } }) {
      await connectDB();
      const query: any = {};
      if (where.id) query.id = where.id;
      if (where.userId) query.userId = where.userId;
      const doc = await Deal.findOne(query).lean();
      return doc ? { ...doc, id: doc.id || doc._id?.toString() } : null;
    },

    async create({ data }: { data: any }) {
      await connectDB();
      const id = data.id || generateId();
      const deal = await Deal.create({ ...data, id });
      return { ...deal.toObject(), id: deal.id || deal._id.toString() };
    },

    async createMany({ data }: { data: Array<any> }) {
      await connectDB();
      const formatted = data.map((d) => ({
        ...d,
        id: d.id || generateId(),
      }));
      const res = await Deal.insertMany(formatted);
      return { count: res.length };
    },

    async update({ where, data }: { where: { id: string }; data: any }) {
      await connectDB();
      const deal = await Deal.findOneAndUpdate({ id: where.id }, { $set: data }, { new: true }).lean();
      if (!deal) throw new Error("Deal not found");
      return { ...deal, id: deal.id || deal._id.toString() };
    },

    async deleteMany({ where }: { where: { id?: string; userId?: string } }) {
      await connectDB();
      const query: any = {};
      if (where.id) query.id = where.id;
      if (where.userId) query.userId = where.userId;
      const res = await Deal.deleteMany(query);
      return { count: res.deletedCount };
    },
  },

  payment: {
    async findMany({ where, orderBy }: { where?: { userId?: string }; orderBy?: { createdAt?: "asc" | "desc" } } = {}) {
      await connectDB();
      const query: any = {};
      if (where?.userId) query.userId = where.userId;
      const sortQuery: any = {};
      if (orderBy?.createdAt) sortQuery.createdAt = orderBy.createdAt === "asc" ? 1 : -1;
      else sortQuery.createdAt = -1;

      const docs = await Payment.find(query).sort(sortQuery).lean();
      return docs.map((d: any) => ({ ...d, id: d.id || d._id?.toString() }));
    },

    async create({ data }: { data: any }) {
      await connectDB();
      const id = data.id || generateId();
      const p = await Payment.create({ ...data, id });
      return { ...p.toObject(), id: p.id || p._id.toString() };
    },

    async count() {
      await connectDB();
      return Payment.countDocuments({});
    },

    async totalRevenue() {
      await connectDB();
      const res = await Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return res[0]?.total || 0;
    },
  },
};
