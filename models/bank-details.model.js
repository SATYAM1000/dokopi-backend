import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "XeroxStore",
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
    },
    branchAddress: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const BankDetails = mongoose.model("BankDetails", bankDetailsSchema);
