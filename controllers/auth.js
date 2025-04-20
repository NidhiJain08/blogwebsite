import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  // Ensure both username and email are provided in the request body
  if (!req.body.username || !req.body.email || !req.body.password) {
    return res.status(400).json("All fields are required");
  }

  // Check if user already exists
  const q = "SELECT * FROM user WHERE email = ? OR username = ?";
  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    // Hash password and create user
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);

      const insertQuery = "INSERT INTO user (`username`, `email`, `password`) VALUES (?)";
      const values = [req.body.username, req.body.email, hash];
      db.query(insertQuery, [values], (err, data) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ error: "Database insert error", details: err });
        }
        return res.status(200).json("User created");
      });
    } catch (error) {
      return res.status(500).json("Error hashing password");
    }
  });
};

export const login = (req, res) => {
  // Ensure both username and password are provided in the request body
  if (!req.body.username || !req.body.password) {
    return res.status(400).json("Both username and password are required");
  }

  // Check if user exists
  const q = "SELECT * FROM user WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User not found");

    // Check password
    const isPwdCorrect = bcrypt.compareSync(req.body.password, data[0].password);
    if (!isPwdCorrect) return res.status(404).json("Wrong username or password");

    // Create JWT token if everything is fine
    const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET_KEY || "jwtkey", { expiresIn: "1h" });
    const { password, ...other } = data[0];

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "none", // Necessary for cross-origin requests
    })
    .status(200)
    .json(other);
  });
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  }).status(200).json("User has been logged out.");
};
