"use strict";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { db } from "./dbs/init.mongodb.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest/index.js";

const app = express();
const port = 3000;

// dbs

// connect MongoDB khi server start
(async () => {
  try {
    await db.connect();
    console.log("🚀 MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1); // dừng app nếu connect fail
  }
})();
// console.log("MongoDB instance:", db);

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// API Routes
app.get("/", (req, res) => res.send("Server is Live"));
// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, () => console.log(`Server is on port ${port}`));
