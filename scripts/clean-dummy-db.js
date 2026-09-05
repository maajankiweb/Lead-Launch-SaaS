const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load .env.local if available
let MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!MONGODB_URI) {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
    if (match) MONGODB_URI = match[1];
  }
}

async function clean() {
  if (!MONGODB_URI) {
    console.error("No MONGODB_URI found in environment or .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const collections = ["users", "campaigns", "leads", "audits", "pitches", "deals", "payments"];
  console.log("\n--- DATABASE STATUS & CLEANUP ---");

  // 1. Delete all demo users
  const demoUsers = await db.collection("users").deleteMany({
    $or: [
      { email: { $regex: /demo/i } },
      { name: { $regex: /demo/i } },
      { id: { $regex: /demo/i } },
    ],
  });
  console.log(`✓ Removed ${demoUsers.deletedCount} demo users`);

  // 2. Report counts across all collections
  console.log("\nCurrent Collection Counts:");
  for (const colName of collections) {
    const count = await db.collection(colName).countDocuments();
    console.log(` - ${colName}: ${count} document(s)`);
  }

  const realUsers = await db.collection("users").find({}).toArray();
  console.log(`\nActive Registered Users (${realUsers.length}):`);
  realUsers.forEach(u => console.log(` - ${u.email} (${u.name}) [Role: ${u.role}, Plan: ${u.plan}]`));

  console.log("\nCleanup Complete! Database is in a clean state.\n");
  await mongoose.disconnect();
}

clean().catch(console.error);

