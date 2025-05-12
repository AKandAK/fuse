const mongoose = require('@backend/common/mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

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
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password),
        message: 'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character @$!%*?&'
      },
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV === 'development', // disable auto-indexing for non dev
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    return next(error);
  }
});


userSchema.methods.comparePassword = async function (inputPassword) {
  try {
    return await bcrypt.compare(inputPassword, this.password);
  } catch (error) {
    throw error;
  }
};

// indexes
// userSchema.index({ email: 1 });


module.exports = mongoose.model('User', userSchema);