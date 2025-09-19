import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  city: { type: String, required: true },
  location: { type: String }
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);
