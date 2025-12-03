import express from "express";
import cors from "cors";
import { env } from "./config/env";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import likeRoutes from "./routes/likes";
import bookingRoutes from "./routes/bookings";
import quoteRoutes from "./routes/quote";
import optionRoutes from "./routes/options";
import blockedDateRoutes from "./routes/blocked-dates";
import galleryRoutes from "./routes/gallery";

const app = express();
const PORT = env.PORT;

// 미들웨어
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/blocked-dates", blockedDateRoutes);
app.use("/api/gallery", galleryRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({ message: "Mini SNS API Server" });
});

// 에러 핸들러
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Something went wrong!" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
