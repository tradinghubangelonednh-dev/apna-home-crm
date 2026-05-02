import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    memberLimit: {
      type: Number,
      default: 5
    },
    description: {
      type: String,
      default: 'A single shared home group for five members'
    }
  },
  {
    timestamps: true
  }
);

export const Household = mongoose.model('Household', householdSchema);
