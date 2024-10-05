import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartItems: [
      {
        fileId: {
          type: String,
          required: true,
        },
        fileKey: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        fileSize: {
          type: String,
          required: true,
        },
        fileExtension: {
          type: String,
          required: true,
        },
        pageCount: {
          type: Number,
          required: true,
        },
        iconPath: {
          type: String,
          default: "/files-icon/other.svg",
        },
        copiesCount: {
          type: Number,
          default: 1,
        },
        xeroxStoreMessage: {
          type: String,
        },
        paperSize: {
          type: String,
          enum: ["A4", "A3", "A2", "A1", "A0"],
          default: "A4",
        },
        printType: {
          type: String,
          enum: ["black_and_white", "simple_color", "digital_color", "mixed"],
          default: "black_and_white",
        },
        printSides: {
          type: String,
          enum: ["single_sided", "double_sided"],
          default: "single_sided",
        },
        colorPages: {
          type: Array,
          default: [],
        },
        mixedPrintType: {
          type: String,
          enum: ["simple_color", "digital_color"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartSchema);
