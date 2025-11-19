import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const admin = await User.findOne({ role: "admin" });
    
    if (!admin) {
      console.log("❌ No admin user found");
      console.log("\n💡 To create an admin, run:");
      console.log("   node scripts/setAdmin.js <email> <password>");
      process.exit(1);
    }

    console.log("📋 Admin Account Details:");
    console.log("   Email:", admin.email);
    console.log("   Name:", admin.firstName, admin.lastName);
    console.log("   Has passwordHash:", !!admin.passwordHash);
    console.log("   Has password (old):", !!admin.password);
    console.log("   isActive:", admin.isActive);
    console.log("   emailVerified:", admin.emailVerified);
    console.log("   deletedAt:", admin.deletedAt || "null");
    
    if (!admin.passwordHash && !admin.password) {
      console.log("\n⚠️  WARNING: Admin has no password!");
      console.log("   Run: node scripts/setAdmin.js", admin.email, "<new-password>");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAdmin();

