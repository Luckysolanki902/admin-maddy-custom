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
    required: true,
    validate: {
      validator: function (array) {
        return array.length > 0; // Ensure at least one role is specified
      },
      message: "There must be at least one role allowed.",
    },
  },
}, { timestamps: true }); // Optionally track created and updated times

export default mongoose.models.AccessControl || mongoose.model("AccessControl", AccessControlSchema);
