const mongoose = require('../mongoose');

const companySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      immutable: true,
    },
    website: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    founded: {
      type: Number,
    },
    size: {
      type: String,
    },
    locality: { type: String, trim: true },
    region: { type: String, trim: true },
    country: { type: String, trim: true },

    industry: {
      type: String,
      trim: true,
    },
    linkedin_url: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500 * 5, // (assuming average 5 chars per word)
    },
    summary_updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    // _id: false,
    autoIndex: process.env.NODE_ENV === 'development', // disable auto-indexing for non dev
    timestamps: true, // createdat, updatedat.
    // dont buffer and wait
    bufferCommands: false,
    // conflicts unlikely
    optimisticConcurrency: false
  }
);

// indexes for fast querying
  companySchema.index(
    { name: 'text', industry: 'text' }, 
    {
      weights: {
        name: 3,    // pref for name match
        industry: 1
      }
    }
  ); // text index on 'name' and industry
  companySchema.index({ size: 1 });
  companySchema.index({ founded: 1 });
  companySchema.index({ country : 1 });
  companySchema.index({ website : 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;