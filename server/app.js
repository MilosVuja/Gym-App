const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/errorController");

const authRouter = require("./routes/authRoutes");
const memberRouter = require("./routes/memberRoutes");
const adminRouter = require("./routes/adminRoutes");
const groupClassRouter = require("./routes/groupClassRoutes");
const trainingPlanRouter = require("./routes/trainingPlan/trainingPlanRoutes");
const musclesRouter = require("./routes/musclesRouter");
const exercisesRouter = require("./routes/exercisesRoutes");
const nutritionPlanRoutes = require("./routes/nutrition/nutritionPlanRoutes");
const mealRoutes = require("./routes/nutrition/mealRoutes");

const measurementsRouter = require("./routes/measurementsRoutes");
const goalsRouter = require("./routes/goalsRoutes");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  max: 1000,
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/group-class", groupClassRouter);
app.use("/api/v1/training-plans", trainingPlanRouter);
app.use("/api/v1/muscles", musclesRouter);
app.use("/api/v1/exercises", exercisesRouter);

app.use("/api/v1/measurements", measurementsRouter);
app.use("/api/v1/goals", goalsRouter);

app.use("/api/v1/nutrition-plans", nutritionPlanRoutes);
app.use("/api/v1/meals", mealRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
