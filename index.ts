import * as dotenv from "dotenv";

dotenv.config();
if (!process.env.FILE) {
  throw new Error(`FILE not Found! Please set it in environment variables.`);
}
const filename = process.env.FILE;
console.log("WORKING!");

