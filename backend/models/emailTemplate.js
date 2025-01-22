import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: Array,
    required: true
  },
  images: [{
    type: String
  }],
  styles: {
    type: Object,
    default: {}
  },
  layout: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('EmailTemplate', emailTemplateSchema);