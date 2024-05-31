import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "XeroxStore",
      required: true,
    },
    cartItems: [
      {
        id: { type: String, required: true },
        fileURL: { type: String, required: true },
        fileOriginalName: { type: String },
        fileSize: { type: String },
        fileExtension: { type: String },
        filePageCount: { type: Number },
        fileIconPath: { type: String },
        fileCopiesCount: { type: Number },
        messageForXeroxStore: { type: String },
        additionalServices: { type: String },
        filePaperType: { type: String },
        fileColorType: { type: String },
        filePrintMode: { type: String },
        fileColorPagesToPrint: { type: [String] },
      },
    ],
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "rejected",
        "delivered",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
