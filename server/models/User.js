import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'user'], default: 'user' },
  city: { type: String } // required for admin, ignored for others
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
