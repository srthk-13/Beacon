import express from "express"
import { authMiddleWare } from "../middleware/auth.js"
import { allowRoles } from "../middleware/role.js"
import { login, logout, register, getMe } from "../controller/auth.controller.js";


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleWare, getMe);


router.get('/admin', authMiddleWare, allowRoles("ADMIN"), (req, res) => {
  res.send("Admin Only")
})
router.get('/manager',
  authMiddleWare,
  allowRoles("ADMIN", "MANAGER"),
  (req, res) => {
    res.send("Manager access")
  }
)
router.get('/dashboard', authMiddleWare, (req, res) => {
  res.send("User DashBoard")
})

export default router