import mongoose from "mongoose";
import crypto from "crypto";

const xeroxStoreSchema = new mongoose.Schema(
  {
    storeDetails: {
      storeRefrenceId: {
        type: String,
        unique: [true, "Store reference ID already exists"],
        trim: true,
        default: () => `dokopi-${crypto.randomBytes(4).toString("hex")}`,
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
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "xeroxstorepricing",
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankDetails",
    },

    storeOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeReviews: [
      { type: mongoose.Schema.Types.ObjectId, ref: "StoreReview" },
    ],

    storeAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    storeProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    storeCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
    storeSetUpProgress: {
      step1: { type: Boolean, default: false }, //  Profile information
      step2: { type: Boolean, default: false }, // images upload
      step3: { type: Boolean, default: false }, //  open and close time
      step4: { type: Boolean, default: false }, //  bank details
    },
    isStoreSetupComplete: { type: Boolean, default: false },
    storeImagesKeys: [
      {
        type: String,
        trim: true,
      },
    ],
    socketId: {
      type: String,
      trim: true,
    },
    instantDelivery: {
      isEnabled: { type: Boolean, default: false },
      duration: { type: String },
      price: { type: Number },
    },
    homeDelivery: {
      isEnabled: { type: Boolean, default: false },
      duration: { type: String },
      price: { type: Number },
    },
  },
  { timestamps: true }
);

xeroxStoreSchema.methods.updateSetupCompletion = function () {
  this.isStoreSetupComplete = Object.values(this.setupProgress).every(
    (step) => step === true
  );
  return this.isStoreSetupComplete;
};

xeroxStoreSchema.index({ storeLocationCoordinates: "2dsphere" });

export const XeroxStore = mongoose.model("XeroxStore", xeroxStoreSchema);
