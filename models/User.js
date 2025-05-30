const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  failedAttempts: { type: Number, default: 0 },
  locked: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
