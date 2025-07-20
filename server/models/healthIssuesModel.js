const healthIssueSchema = new mongoose.Schema({
  bodyPart: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  chronic: {
    type: Boolean,
    default: false,
  },
  severity: {
    type: String,
    enum: ["Mild", "Moderate", "Severe"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  tags: [String], //["rehab", "surgery", "needs-clearance"]
  createdAt: {
    type: Date,
    default: Date.now,
  },
});