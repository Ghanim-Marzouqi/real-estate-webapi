// import needed modules
const mongoose = require("mongoose");

// create schema
const Property = new mongoose.Schema(
  {
    region: { type: String, required: false },
    willayat: { type: String, required: false },
    village: { type: String, required: false },
    zone: { type: String, required: false },
    price: { type: String, required: false },
    area: { type: String, required: false },
    contract: { type: String, required: false },
    type: { type: String, required: false },
    source: { type: String, required: false },
    year: { type: Number, required: false },
  },
  {
    timestamps: true
  },
);

// export mongoose model
module.exports = mongoose.model("properties", Property);