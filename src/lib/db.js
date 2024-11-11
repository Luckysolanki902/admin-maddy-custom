import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let isConnected = false; // track the connection

export const connectToDatabase = async () => {
  if (isConnected) {
    // Use existing database connection
    return;
  }

  try {
    // Create new connection if not already connected
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw new Error("Failed to connect to MongoDB");
  }
};
