const mongoose = require('mongoose');

// TODO: pwds, tokens/redis

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Invalid email format'
      },
      index: true // Explicitly add an index on email for efficient lookups by email
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV === 'development', // disable auto-indexing for non dev
    // dont buffer and wait
    bufferCommands: false,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('User', userSchema);