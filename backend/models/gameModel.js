const mongoose = require('mongoose');

// Define the schema for game deals
const dealSchema = new mongoose.Schema({
  storeID: { type: String, required: true },
  price: { type: Number, required: true }
});

// Define the schema for games
const gameSchema = new mongoose.Schema({
  gameID: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  thumb: { type: String },
  cheapestPrice: { type: Number, required: true },
  deals: { type: [dealSchema], validate: [arrayLimit, '{PATH} exceeds the limit of 10'] }
});

// Custom validator to limit the number of deals
function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model('Game', gameSchema);