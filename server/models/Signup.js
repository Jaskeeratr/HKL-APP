import mongoose from 'mongoose';

const SignupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  type: { type: String, enum: ['personal', 'event'], required: true },
  category: { type: String, enum: ['signup', 'conversation'], default: 'signup' },
  personName: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now },
  city: { type: String } // denormalized for easy filtering
}, { timestamps: true });

export default mongoose.model('Signup', SignupSchema);
