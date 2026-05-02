import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    entityType: {
      type: String,
      enum: ['expense', 'settlement', 'recurring', 'household', 'auth'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'complete', 'remind', 'login', 'role_update'],
      required: true
    },
    before: {
      type: Object,
      default: null
    },
    after: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
