// generate-jwt.js
import jwt from "jsonwebtoken";

// Use the same secret you set in server/.env
const secret = "supersecret_change_me"; // replace with your real JWT_SECRET

// Example payload (normally: MongoDB ObjectId from your user document)
const payload = {
  id: "66f3a4f2d1234abc56789def", // replace with your user's _id from MongoDB
  role: "super_admin",             // or "admin", "user"
};

const token = jwt.sign(payload, secret, { expiresIn: "7d" });
console.log("JWT Token:", token);
