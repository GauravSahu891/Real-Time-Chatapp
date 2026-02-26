import mongoose from "mongoose";

const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    fullname: { type: String, required: true },
    password: { type: String, required: true },
    verificationToken: { type: String, required: true },
    verificationTokenExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingSignupSchema.index({ verificationToken: 1 });
pendingSignupSchema.index({ email: 1 });

const PendingSignup = mongoose.model("PendingSignup", pendingSignupSchema);

export default PendingSignup;
