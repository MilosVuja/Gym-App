const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/errorController");

const authRouter = require("./routes/authRoutes");
const memberRouter = require("./routes/memberRoutes");
const adminRouter = require("./routes/adminRoutes");
const groupClassRouter = require("./routes/groupClassRoutes");
const trainingPlanRouter = require("./routes/trainingPlan/trainingPlanRoutes");
const musclesRouter = require("./routes/musclesRouter");
const exercisesRouter = require("./routes/exercisesRoutes");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP! Please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: ["maxGroupSize", "ratingsAverage", "difficulty"],
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/group-class", groupClassRouter);
app.use("/api/v1/training-plans", trainingPlanRouter);
app.use("/api/v1/muscles", musclesRouter);
app.use("/api/v1/exercises", exercisesRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
