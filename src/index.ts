import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import config from "./config/config";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 900000,
  max: 10,
});
app.use(limiter);

// Routes
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

// Connect to MongoDB
mongoose
  .connect(config.DB.MONGODB_URI || config.DB.MONGODB_LOCAL_URI || "", {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: "majority",
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    retryReads: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    // Try to connect using the direct URI if the SRV connection fails
    if (config.DB.MONGODB_DIRECT_URI) {
      console.log("Attempting to connect using direct URI...");
      mongoose
        .connect(config.DB.MONGODB_DIRECT_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          family: 4,
          retryWrites: true,
          w: "majority",
        })
        .then(() => {
          console.log("Connected to MongoDB using direct URI");
          const port = process.env.PORT || 3000;
          app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
          });
        })
        .catch((directError) => {
          console.error("Direct connection also failed:", directError);
          process.exit(1);
        });
    } else {
      // If no direct URI is available, retry the original connection
      setTimeout(() => {
        console.log("Retrying MongoDB connection...");
        process.exit(1);
      }, 5000);
    }
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
