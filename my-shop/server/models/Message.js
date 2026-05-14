const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

 
  sender: {

    id: String,

    name: String,

    email: String
  },

 
  receiver: {

    id: String,

    name: String,

    email: String
  },

 
  product: {

    id: String,

    title: String,

    image: String
  },

 
  text: {
    type: String,
    required: true
  },

 
  isRead: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports =
  mongoose.model("Message", messageSchema);