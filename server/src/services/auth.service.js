import User from "../modules/user/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
export const registerUser = async (data) => {
  const { name, email, password, role } = data;
  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error("User already exists");
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash: hash,
    role: role || "DEVELOPER",
  })
  return user;
}
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User Not Found");
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Invalid credentials");
  const token = jwt.sign({
    id: user._id,
    role: user.role,
  },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return { user, token }
}