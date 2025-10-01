

import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import sendMail, { sendForgotMail } from "../middlewares/sendMail.js";


export const registerUser = (async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    // Check if the user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User Already exists",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new User document instance
    const newUser = new User({
      name,
      email,
      role,
      password: hashPassword,
    });

    // Save the new user document to the database
    const savedUser = await newUser.save();

    // Respond with a success message and the saved user data
    res.status(200).json({
      message: "User registered successfully",
      user: savedUser,
    });

  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});





//login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in user login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//my profile
export const myProfile=async(req,res)=>{
  try {
  const userId = req.user.id
  let user=await User.findById(userId).populate('parscess')
  return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in fetching user profile:", error);
    res.status(500).json({message:"Internal server error"});
  }
};

//get all user
export const getAlluser = async (req, res) => {
    try {
        // Find all documents in the User collection
        const getusers = await User.find().select('-password'); // Exclude sensitive fields like password

        // The check for empty array (Mongoose returns [] if no documents found)
        if (!getusers || getusers.length === 0) {
            // Returning 200 status with an empty array is often better than 404/400 for 'list all' endpoints
            return res.status(200).json({ 
                message: "No users found in the database.",
                users: []
            });
        }

        // Success: Return the fetched users
        return res.status(200).json({
            message: "Users fetched successfully",
            users: getusers // Correct variable name is 'getusers'
        });

    } catch (error) {
        // Handle any server or database errors
        console.error("Error fetching all users:", error); 
        
        // CRUCIAL: Send a 500 error response if something goes wrong
        return res.status(500).json({
            message: "Internal Server Error during user fetch",
            error: error.message
        });
    }
};







































