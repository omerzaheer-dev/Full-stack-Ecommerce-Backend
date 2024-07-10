import { Router } from "express";
import { parsing } from "../controllers/apple.controller.js";
const router = Router()
router.route("/po").post(parsing)
export default router