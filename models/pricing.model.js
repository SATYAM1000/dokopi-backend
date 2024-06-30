import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "XeroxStore",
      required: true,
    },
    paperSize: {
      type: String,
      enum: ["A4", "A3", "A2", "A1", "A0"],
      required: true,
    },
    printType: {
      type: String,
      enum: ["black_and_white", "simple_color", "digital_color"],
      required: true,
    },
    printSided: {
      type: String,
      enum: ["single_sided", "double_sided"],
      required: true,
    },
    conditionRule: {
      type: String,
      enum: ["quantity", "price"],
      required: true,
    },
    comparisonOperator: {
      type: String,
      enum: ["<", "<=", ">", ">=", "=="],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pricing", pricingSchema);
