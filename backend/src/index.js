import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const __driname = path.resolve();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__driname, "../frontend/dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(__driname, "../frontend", "dist", "index.html"));
  });
}

// init
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
});
