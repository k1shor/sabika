import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

const globalForMongoose = globalThis;

if (!globalForMongoose._mongoose) {
  globalForMongoose._mongoose = { conn: null, promise: null };
}

export function useDb() {
  return String(process.env.USE_DB).toLowerCase() === "true";
}

export async function dbConnect() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

  if (globalForMongoose._mongoose.conn) return globalForMongoose._mongoose.conn;

  if (!globalForMongoose._mongoose.promise) {
    globalForMongoose._mongoose.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  globalForMongoose._mongoose.conn = await globalForMongoose._mongoose.promise;
  return globalForMongoose._mongoose.conn;
}
