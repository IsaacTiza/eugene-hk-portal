import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { startCronJobs } from "./utils/cronJobs.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server from express app
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

// Replace app.listen with server.listen
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
  startCronJobs();
});
