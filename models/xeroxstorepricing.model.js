import mongoose from "mongoose";

const PricingRuleSchema = new mongoose.Schema({
  conditionName: {
    type: String,
    enum: ["quantity", "urgency"],
    required: true,
  },
  comparisonOperator: {
    type: String,
    enum: ["greater_than", "less_than", "equal_to"],
    required: true,
  },
  conditionValue: {
    type: Number,
    required: true,
  },
  conditionPrice: {
    type: Number,
    required: true,
  },
});

const XeroxStorePricingSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "XeroxStore",
      required: true,
    },
    priceList: [
      {
        printType: {
          type: String,
          enum: ["black_and_white", "simple_color", "digital_color"],
          required: true,
        },
        printingSides: {
          type: String,
          enum: ["single_sided", "double_sided"],
          required: true,
        },
        basePrice: {
          type: Number,
          required: true,
        },
        paperSize: {
          type: String,
          enum: ["A0", "A1", "A2", "A3", "A4", "A5"],
        },
        conditionsList: [PricingRuleSchema],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const xeroxstorepricing = mongoose.model(
  "xeroxstorepricing",
  XeroxStorePricingSchema
);
