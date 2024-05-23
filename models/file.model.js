import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    // Basic File Information
    basicFileInfo: {
      fileURL: {
        type: String,
        required: true,
      },
      fileOriginalName: {
        type: String,
        required: true,
      },
      fileExtension: {
        type: String,
        enum: ["pdf", "docx", "jpg", "png", "jpeg", "pptx"],
      },
      fileSize: {
        type: String,
        required: true,
      },
      filePageCount: {
        type: Number,
        required: true,
      },
      filePrice: {
        type: Number,
      },
      fileOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      fileIconPath: {
        type: String,
        default: "/files-icon/other.svg",
      },
    },

    // Print Settings
    printSettings: {
      fileColorType: {
        type: String,
        enum: ["black and white", "color", "mixed"],
        default: "black and white",
      },
      filePrintMode: {
        type: String,
        enum: ["simplex", "duplex"],
        default: "simplex",
      },
      filePaperType: {
        type: String,
        enum: ["A4", "A3", "Letter"],
        default: "A4",
      },
      fileCopiesCount: {
        type: Number,
        default: 1,
      },
      messageForXeroxStore: {
        type: String,
      },
      additionalServices: {
        type: [String],
        enum: ["binding", "lamination", "taping"],
      },
    },

    // File Status
    fileStatus: {
      type: String,
      enum: ["uploaded", "processing", "printed", "delivered", "cancelled"],
      default: "uploaded",
    },
    filePrintedAt: {
      type: Date,
    },
    fileSharedWith: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const File = mongoose.model("File", fileSchema);
