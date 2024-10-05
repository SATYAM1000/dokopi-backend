import mongoose from "mongoose";

const storeReviewSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'XeroxStore',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  orderId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
});

export const StoreReview = mongoose.model('StoreReview', storeReviewSchema);

