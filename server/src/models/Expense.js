import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    percentage: Number
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    title: {
      type: String,
      default: '',
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
    splits: {
      type: [splitSchema],
      default: []
    },
    category: {
      type: String,
      enum: ['food', 'rent', 'electricity', 'misc'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recurringSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringExpense'
    }
  },
  {
    timestamps: true
  }
);

export const Expense = mongoose.model('Expense', expenseSchema);
