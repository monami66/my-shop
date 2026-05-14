const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  items: Array,
  total: Number,
  status: { type: String, default: "Новый" }
});

module.exports = mongoose.model("Order", OrderSchema);