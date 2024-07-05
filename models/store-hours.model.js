import mongoose from "mongoose";

const storeHoursSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "XeroxStore",
      required: true,
    },
    Monday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
    Tuesday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
    Wednesday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
    Thursday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
    Friday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
    Saturday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
    Sunday: {
      open: { type: String },
      close: { type: String },
      isOpen: { type: Boolean },
    },
  },
  {
    timestamps: true,
  }
);

export const StoreHours = mongoose.model("StoreHours", storeHoursSchema);
