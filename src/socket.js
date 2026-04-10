import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Message from "./models/Message.js";
import Match from "./models/Match.js";

// Socket.io equivalent of catchAsync
const catchSocketAsync =
  (fn) =>
  async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      console.error("Socket error:", err.message);
      // args[0] is always the socket in event handlers
      const socket = args[args.length - 1];
      if (socket && socket.emit) {
        socket.emit("error", { message: err.message });
      }
    }
  };

export const initSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token)
        return next(new Error("Authentication error: No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Authentication error: User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Join a match room
    socket.on(
      "join_room",
      catchSocketAsync(async (matchId, callback) => {
        if (!matchId) {
          return socket.emit("error", { message: "Match ID is required" });
        }

        const match = await Match.findOne({
          _id: matchId,
          users: socket.user._id,
          isActive: true,
        });

        if (!match) {
          return socket.emit("error", {
            message: "Match not found or inactive",
          });
        }

        socket.join(matchId);
        console.log(`${socket.user.username} joined room: ${matchId}`);
        socket.emit("joined_room", { matchId });
      }, socket),
    );

    // Send a message
    socket.on(
      "send_message",
      catchSocketAsync(async (data) => {
        const { matchId, receiverId, content, type = "text" } = data;

        if (!matchId || !receiverId || !content) {
          return socket.emit("error", {
            message: "matchId, receiverId and content are required",
          });
        }

        const match = await Match.findOne({
          _id: matchId,
          users: socket.user._id,
          isActive: true,
        });

        if (!match) {
          return socket.emit("error", {
            message: "Match not found or inactive",
          });
        }

        const message = await Message.create({
          match: matchId,
          sender: socket.user._id,
          receiver: receiverId,
          content,
          type,
        });

        io.to(matchId).emit("receive_message", {
          _id: message._id,
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            profilePicture: socket.user.profilePicture,
          },
          content: message.content,
          type: message.type,
          isRead: message.isRead,
          createdAt: message.createdAt,
        });
      }, socket),
    );

    // Mark messages as read
    socket.on(
      "mark_read",
      catchSocketAsync(async (matchId) => {
        if (!matchId) {
          return socket.emit("error", { message: "Match ID is required" });
        }

        await Message.updateMany(
          { match: matchId, receiver: socket.user._id, isRead: false },
          { isRead: true, readAt: Date.now() },
        );

        socket.to(matchId).emit("messages_read", {
          matchId,
          readBy: socket.user._id,
        });
      }, socket),
    );

    // Delete a message
    socket.on(
      "delete_message",
      catchSocketAsync(async (messageId) => {
        if (!messageId) {
          return socket.emit("error", { message: "Message ID is required" });
        }

        const message = await Message.findOne({
          _id: messageId,
          sender: socket.user._id,
        });

        if (!message) {
          return socket.emit("error", {
            message: "Message not found or unauthorized",
          });
        }

        message.isDeleted = true;
        message.deletedAt = Date.now();
        message.deletedBy = socket.user._id;
        await message.save();

        io.to(message.match.toString()).emit("message_deleted", { messageId });
      }, socket),
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};
