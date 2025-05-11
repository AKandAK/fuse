const mongoose = require('../../../common/mongoose');

const userBookmarkSchema = new mongoose.Schema(
  {
    // refer objectid of user table _id .
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // efficient lookups
    },
    // refer onjectid of company table _id
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
  },
  {
    timestamps: true,
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

// indexes
userBookmarkSchema.index({ user: 1, company: 1 }, { unique: true });
userBookmarkSchema.index({ user: 1, createdAt: -1 });


module.exports = mongoose.model('UserBookmark', userBookmarkSchema);