import { loginUser, registerUser, getMeProfile } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({
      message: "User Registered",
      token,
      user
    })
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
export const logout = async (req, res) => {
  // JWT me server side logout nahi hota (stateless)
  res.status(200).json({ message: "Logout successful" });
};

export const getMe = async (req, res) => {
  try {
    const user = await getMeProfile(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};