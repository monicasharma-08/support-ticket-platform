// server/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [2000, 'Comment cannot be more than 2000 characters'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Only use createdAt, no updatedAt for comments
  }
);

// Auto-populate author
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'name email role',
  });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);