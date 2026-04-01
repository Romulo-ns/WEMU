const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Basic .env.local loader to handle parameters if dotenv is not present
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.error("Warning: Could not load .env.local");
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wemu';

async function seed() {
  // Safeguard: Check if we are accidentally in a production environment
  // We check for common production indicators in the URI or NODE_ENV
  if (process.env.NODE_ENV === 'production' || 
      MONGODB_URI.includes('railway') || 
      MONGODB_URI.includes('mongodb.net') || 
      MONGODB_URI.includes('atlas')) {
    console.error("❌ ABORTING: Cannot run seed script in a production-like or remote environment!");
    console.log("Environment check failed. Script can only run on localhost.");
    process.exit(1);
  }

  console.log(`Connecting to database: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);

  // Define minimal Schema to avoid Next.js model resolution issues in a plain node script
  // This matches the core structure of src/lib/models/User.ts
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    bio: { type: String, default: "" },
    image: { type: String }
  }, { timestamps: true });

  // Use existing model or define it
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  console.log("Cleaning up existing test users (@wemutest.com)...");
  const deleteResult = await User.deleteMany({ email: /@wemutest.com$/ });
  console.log(`Removed ${deleteResult.deletedCount} existing test users.`);

  const password = "123456";
  // NextAuth commonly uses 12 rounds for bcrypt
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log("Generating 10 test users...");
  const users = [];
  for (let i = 1; i <= 10; i++) {
    users.push({
      name: `Test User ${i}`,
      email: `user${i}@wemutest.com`,
      password: hashedPassword,
      bio: `I am a music lover and test user number ${i}!`,
      image: `https://ui-avatars.com/api/?name=Test+User+${i}&background=8b5cf6&color=fff`
    });
  }

  await User.insertMany(users);
  
  console.log("\n==================================================");
  console.log("✅ SEEDED SUCCESSFUL!");
  console.log("==================================================");
  console.log("10 users created with emails: user1@wemutest.com to user10@wemutest.com");
  console.log("Password for all: 123456");
  console.log("==================================================\n");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
