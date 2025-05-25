const { default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const sendEmail = require("./../utilities/email");

const gender = ["male", "female", "other"];
const exp = ["beginner", "intermediate", "advanced"];

const MeasurementsSchema = new mongoose.Schema({
  height: Number,
  weight: Number,
  bodyFat: Number,
  bmi: Number,
  waist: Number,
  arm: Number,
  thigh: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const StrengthStatsSchema = new mongoose.Schema({
  squat: Number,
  bench: Number,
  deadlift: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const memberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxlength: [
        20,
        "A first name must have less or equal then 20 characters!",
      ],
      required: [true, "Please provide your first name!"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [
        20,
        "A last name must have less or equal then 20 characters!",
      ],
      required: [true, "Please provide your last name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide valid email!"],
      trim: true,
      unique: true,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["member", "admin", "trainer"],
      default: "member",
    },
    pinCode: {
      type: String,
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number!"],
    },
    sex: {
      type: String,
      enum: gender,
      default: "other",
    },
    address: String,
    goal: {
      type: String,
      enum: [
        "weight loss",
        "muscle gain",
        "strength",
        "endurance",
        "general fitness",
        "flexibility",
        "other",
      ],
      required: [true, "Please specify your fitness goal"],
    },
    membership: {
      type: {
        type: String,
        enum: ["basic", "premium", "vip"],
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ["active", "expired", "suspended"],
        default: "active",
      },
    },

    activeTrainingPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingPlan",
    },
    trainingHistory: [
      {
        plan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TrainingPlan",
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        feedback: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        completedSessions: [
          {
            date: {
              type: Date,
              default: Date.now,
            },
            exercises: [
              {
                name: { type: String, required: true },
                sets: { type: Number, default: null },
                reps: { type: Number, default: null },
                weight: { type: Number, default: null },
                duration: { type: Number, default: null },
                notes: String,
              },
            ],
          },
        ],
      },
    ],

    currentMeasurements: MeasurementsSchema,
    measurementsHistory: [MeasurementsSchema],

    currentStrengthStats: StrengthStatsSchema,
    strengthStatsHistory: [StrengthStatsSchema],

    experience: {
      type: String,
      enum: exp,
      default: "beginner",
    },

    medicalConditions: [
      {
        condition: String,
        notes: String,
        diagnosedDate: Date,
      },
    ],
    injuries: [
      {
        type: String,
        date: Date,
        status: {
          type: String,
          enum: ["active", "recovered"],
          default: "active",
        },
      },
    ],

    preferredTrainingDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],
    preferredTrainingTime: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
    },

    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      workoutReminders: {
        type: Boolean,
        default: true,
      },
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
    lastLogin: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

memberSchema.virtual("upcomingSessions", {
  ref: "Session",
  foreignField: "member",
  localField: "_id",
});

memberSchema.index({ "membership.endDate": 1 });

memberSchema.pre("save", async function (next) {
  let password = "";
  let chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let passwordLength = 12;

  for (let i = 0; i <= passwordLength; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  this.pinCode = await bcrypt.hash(password, 12);

  this.confirmPinCode = undefined;

  await sendEmail({
    email: this.email,
    subject: "Login information",
    message: `This is your login password ${password}`,
  });

  next();
});

memberSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

memberSchema.methods.correctPinCode = async function (
  candidatePinCode,
  memberPinCode
) {
  return await bcrypt.compare(candidatePinCode, memberPinCode);
};

memberSchema.methods.updateMeasurements = function (newMeasurements) {
  if (this.currentMeasurements) {
    this.measurementsHistory.push(this.currentMeasurements);
  }
  this.currentMeasurements = newMeasurements;
};

memberSchema.methods.updateStrengthStats = function (newStats) {
  if (this.currentStrengthStats) {
    this.strengthStatsHistory.push(this.currentStrengthStats);
  }
  this.currentStrengthStats = newStats;
};

const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
