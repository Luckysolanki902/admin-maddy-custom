// models/AccessControl.js
import mongoose from "mongoose";

const AccessControlSchema = new mongoose.Schema({
  pathname: {
    type: String,
    required: true,
    unique: true,
  },
  rolesAllowed: {
    type: [String],
    default: ['admin'], // Default to allowing admins
  },
}, { timestamps: true }); // Optionally track created and updated times

export default mongoose.models.AccessControl || mongoose.model("AccessControl", AccessControlSchema);
