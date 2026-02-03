import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateTokenForUser from '../config/generateTokenForUser.js';

// ✅ Security Questions List
export const securityQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
  "What street did you grow up on?",
  "What was your first car?",
  "What is your favorite food?"
];

/*
GET Security Questions List
Method: GET
path: /api/users/security-questions
*/
export const getSecurityQuestions = async (req, res) => {
  res.json(securityQuestions);
};

/*
User Registration (UPDATED with security question)
Method: POST
path: /api/users/register
*/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hash security answer (case-insensitive)
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateTokenForUser(user._id)
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
User Login
Method: POST
path: /api/users/login
*/
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateTokenForUser(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
Get User Profile
Method: GET
path: /api/users/profile
*/
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -securityAnswer');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Update User Profile
Method: PUT
path: /api/users/profile
*/
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Change Password
Method: PUT
path: /api/users/password
*/
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Get Security Question by Email (Forgot Password Step 1)
Method: POST
path: /api/users/forgot-password/question
*/
export const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('securityQuestion');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ securityQuestion: user.securityQuestion });
  } catch (error) {
    console.error("Error fetching security question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Verify Security Answer (Forgot Password Step 2)
Method: POST
path: /api/users/forgot-password/verify
*/
export const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare hashed answer (case-insensitive)
    const isMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect answer" });
    }

    // Generate token for password reset
    const resetToken = generateTokenForUser(user._id);

    res.json({ 
      message: "Security answer verified",
      resetToken,
      userId: user._id
    });
  } catch (error) {
    console.error("Error verifying security answer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Reset Password (Forgot Password Step 3)
Method: POST
path: /api/users/forgot-password/reset
*/
export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Update Security Question
Method: PUT
path: /api/users/security-question
*/
export const updateSecurityQuestion = async (req, res) => {
  try {
    const { currentPassword, securityQuestion, securityAnswer } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password for security
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new security answer
    const salt = await bcrypt.genSalt(10);
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    user.securityQuestion = securityQuestion;
    user.securityAnswer = hashedAnswer;
    await user.save();

    res.json({ message: "Security question updated successfully" });
  } catch (error) {
    console.error("Error updating security question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*
Delete Account
Method: DELETE
path: /api/users/account
*/
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
