// server/models/Ticket.js
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
console.log('DEBUG: Ticket =', Ticket);
console.log('DEBUG: Ticket.find =', typeof Ticket.find);

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a ticket description'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved', 'Closed'],
        message: 'Status must be Open, In Progress, Resolved, or Closed',
      },
      default: 'Open',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Priority must be Low, Medium, High, or Critical',
      },
      default: 'Medium',
    },
    category: {
      type: String,
      enum: {
        values: [
          'Billing',
          'Technical Issue',
          'Account Access',
          'Feature Request',
          'General Inquiry',
        ],
        message:
          'Category must be one of: Billing, Technical Issue, Account Access, Feature Request, General Inquiry',
      },
      default: 'General Inquiry',
    },
    suggestedResponse: {
      type: String,
      default: 'We have received your ticket and will respond shortly.',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    history: [
      {
        action: {
          type: String,
          enum: ['created', 'status_changed', 'assigned', 'unassigned'],
        },
        previousValue: String,
        newValue: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
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

// Index for searching
ticketSchema.index({ title: 'text', description: 'text' });

// Populate refs when fetching
ticketSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'name email',
  }).populate({
    path: 'assignedTo',
    select: 'name email',
  }).populate({
    path: 'comments',
  });

  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);