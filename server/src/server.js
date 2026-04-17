import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedDatabase } from "./utils/seedData.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to server/.env before starting the backend.");
  }

  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed.");
  console.error(error.message);
  process.exit(1);
});
