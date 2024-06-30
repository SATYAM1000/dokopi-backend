import mongoose from "mongoose";

const xeroxStoreSchema = new mongoose.Schema(
  {
    storeDetails: {
      storeRefrenceId: {
        type: String,
        unique: [true, "Store reference ID already exists"],
        required: true,
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
        required: true,
        trim: true,
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
      storeOpeningHours: {
        Monday: { type: String, trim: true },
        Tuesday: { type: String, trim: true },
        Wednesday: { type: String, trim: true },
        Thursday: { type: String, trim: true },
        Friday: { type: String, trim: true },
        Saturday: { type: String, trim: true },
        Sunday: { type: String, trim: true },
      },
      storeServices: [{ type: String }],
      storeDescription: { type: String, trim: true },
    },
    storeLocationCoordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
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
        default:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ4HtE_O8tvs-TlF27vWMWHjxoCQ7HmFmZHBkZpKt1n4PFIN-aN&usqp=CAU",
      },
    ],
    pricing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pricing",
      required: true,
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankDetails",
      required: true,
    },
    storeOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "StoreReview" }],
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
