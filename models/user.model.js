import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      default: "https://github.com/shadcn.png",
    },
    role: {
      type: String,
      enum: ["USER", "MERCHANT", "ADMIN"],
      default: "USER",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    isStoreOwner: {
      type: String,
      default: false,
    },
    socketId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
