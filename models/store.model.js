import mongoose from "mongoose";

const xeroxStoreSchema = new mongoose.Schema(
  {
    storeDetails: {
      storeRefrenceId: {
        type: String,
        unique: [true, "Store reference ID already exists"],
        trim: true,
      },
      storeName: {
        type: String,
        required: true,
        trim: true,
      },
      storePhoneNumber: {
        type: String,
        required: true,
        trim: true,
        unique: [true, "Phone number already exists"],
      },
      storeEmail: {
        type: String,
        trim: true,
        required: true,
        unique: [true, "Email already exists"],
      },
      storeLocation: {
        storeLandmark: { type: String, trim: true },
        storeZipCode: { type: String, trim: true },
        storeCity: { type: String, trim: true },
        storeState: { type: String, trim: true },
        storeCountry: { type: String, trim: true },
      },
      storeLogoURL: { type: String, trim: true },

      storeServices: [{ type: String }],
      storeDescription: { type: String, trim: true },
    },
    storeLocationCoordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    storeTiming: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreHours",
    },
    storeStatus: {
      isStoreVerified: { type: Boolean, default: false },
      isStoreBlocked: { type: Boolean, default: false },
    },
    storeCurrentStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "closed",
    },
    storeImagesURL: [
      {
        type: String,
        trim: true,
      },
    ],
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pricing",
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankDetails",
    },
    
    storeOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeReviews: [
      { type: mongoose.Schema.Types.ObjectId, ref: "StoreReview" },
    ],
    storeWalletBalance: {
      type: Number,
      default: 0,
    },
    storeAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    storeProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    storeCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
    isStoreOpen: { type: Boolean, default: true },
    storeOpenedAt: { type: Date, default: Date.now },
    storeCreatedDate: { type: Date, default: Date.now },
    socketId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

xeroxStoreSchema.index({ storeLocationCoordinates: "2dsphere" });

export const XeroxStore = mongoose.model("XeroxStore", xeroxStoreSchema);
