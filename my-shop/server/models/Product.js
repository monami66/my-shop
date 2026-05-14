const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

  userName: {
    type: String
  },

  text: {
    type: String
  },

  rating: {
    type: Number
  }

});

const productSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  // главное фото
  image: {
    type: String,
    required: true
  },

  // 🖼 галерея фото
  images: {
    type: [String],
    default: []
  },

  category: {
    type: String,
    default: "Другое"
  },

  city: {
    type: String,
    default: "Не указан"
  },

  status: {
    type: String,
    default: "В наличии"
  },

  article: {
    type: String,
    default: ""
  },

  brand: {
    type: String,
    default: ""
  },

  color: {
    type: String,
    default: ""
  },

  size: {
    type: String,
    default: ""
  },

  condition: {
    type: String,
    default: "Новое"
  },

  user: {
    id: String,
    name: String,
    email: String
  },

  reviews: [reviewSchema]

}, {
  timestamps: true
});

module.exports =
  mongoose.model("Product", productSchema);