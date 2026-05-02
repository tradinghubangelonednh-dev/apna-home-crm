import mongoose from 'mongoose';

const recurringSplitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const recurringExpenseSchema = new mongoose.Schema(
  {
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage'],
      required: true
    },
    exactSplits: {
      type: [recurringSplitSchema],
      default: []
    },
    percentageSplits: {
      type: [recurringSplitSchema],
      default: []
    },
    category: {
      type: String,
      enum: ['food', 'rent', 'electricity', 'misc'],
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    nextRunAt: {
      type: Date,
      required: true
    },
    lastRunAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema);
