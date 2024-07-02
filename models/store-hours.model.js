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
      open: { type: String, required: true },
      close: { type: String, required: true },
      isOpen: { type: Boolean },
    },
    Wednesday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      isOpen: { type: Boolean },
    },
    Thursday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      isOpen: { type: Boolean },
    },
    Friday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      isOpen: { type: Boolean },
    },
    Saturday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      isOpen: { type: Boolean },
    },
    Sunday: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      isOpen: { type: Boolean },
    },
  },
  {
    timestamps: true,
  }
);

export const StoreHours = mongoose.model("StoreHours", storeHoursSchema);
