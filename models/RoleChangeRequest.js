const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleChangeRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestedRole: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoleChangeRequest', roleChangeRequestSchema);
