// import needed modules
const mongoose = require("mongoose");

// create schema
const Property = new mongoose.Schema(
  {
    region: { type: String, required: true },
    willayat: { type: String, required: true },
    village: { type: String, required: false },
    zone: { type: String, required: false },
    price: { type: mongoose.Types.Decimal128, required: true },
    area: { type: Number, required: false },
    type: { type: String, required: true },
    source: { type: String, required: true },
    year: { type: Number, required: true },
  },
  {
    timestamps: true
  },
);

// export mongoose model
module.exports = mongoose.model("properties", Property);