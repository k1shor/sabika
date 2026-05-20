import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const USE_DB = process.env.USE_DB;

const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

export function isDbEnabled() {
  return String(process.env.USE_DB).toLowerCase() === "true";
  // if (!globalForMongoose.mongoose) {
  //   globalForMongoose.mongoose = {
  //     conn: null,
  //     promise: null,
  //   };
  // }
}

  export async function dbConnect() {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI missing");
    }

    if (globalForMongoose.mongoose.conn) {
      return globalForMongoose.mongoose.conn;
    }

    if (!globalForMongoose.mongoose.promise) {
      globalForMongoose.mongoose.promise = mongoose
        .connect(MONGODB_URI)
        .then((mongoose) => mongoose);
    }

    globalForMongoose.mongoose.conn =
      await globalForMongoose.mongoose.promise;

    return globalForMongoose.mongoose.conn;
  }

  export function useDb() {
    if (USE_DB === "false") return false;
    return Boolean(MONGODB_URI);
  }
