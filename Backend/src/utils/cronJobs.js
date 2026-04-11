import cron from "node-cron";
import User from "../models/User.js";

// Runs every day at midnight
export const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await User.deleteMany({
        isVerified: false,
        emailVerificationExpiresAt: { $lt: Date.now() },
      });
      console.log(`Cron job: deleted ${result.deletedCount} unverified users`);
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });

  console.log("Cron jobs started");
};
