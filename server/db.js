import mongoose from "mongoose";

let connectionPromise;

export async function connectToDatabase(uri) {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
  }

  await connectionPromise;
}
