import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required!"],
    minLength: [3, "First Name must contain at least 3 characters!"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required!"],
    minLength: [3, "Last Name must contain at least 3 characters!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    validate: [validator.isEmail, "Please provide a valid email address!"],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required!"],
    validate: {
      validator: (value) => /^\d{10}$/.test(value),
      message: "Phone number must contain exactly 11 digits!",
    },
  },
  nic: {
    type: String,
    required: [true, "NIC is required!"],
    validate: {
      validator: (value) => /^\d{3}$/.test(value),
      message: "NIC must contain exactly 3 digits!",
    },
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required!"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required!"],
    enum: ["Male", "Female"],
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    select: false, // Exclude password by default in queries
  },
  role: {
    type: String,
    required: [true, "User role is required!"],
    enum: ["Patient", "Doctor", "Admin"],
  },
  doctorDepartment: {
    type: String,
    default: null,
  },
  docAvatar: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
});

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const User = mongoose.model("User", userSchema);
