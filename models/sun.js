const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sunItemSchema = new Schema({
  name: { type: String, default: '' },
  new: { type: Boolean, default: true },
  best: { type: Boolean, default: true },
  images: { 
    type: Map, // Use Map to allow dynamic keys
    of: [String] // The values will be arrays of strings
  },
  color: { type: [String], required: true }, // Array of strings for colors
  material: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: null },
  shape: { type: String, required: true },
  gender: { type: String, required: true },
}, { timestamps: true });

const Sun = mongoose.model('Sun', sunItemSchema);
module.exports = Sun;
