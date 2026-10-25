import mongoose from "mongoose";

// Cache the connection across hot reloads (dev) and lambda invocations (prod)
const cached = global._mongooseConnection || (global._mongooseConnection = { conn: null, promise: null });

const connectDb = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to .env.local");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .catch((error) => {
        cached.promise = null;
        console.error("Failed to connect to MongoDB:", error.message);
        throw new Error("Failed to connect to the database");
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDb;
