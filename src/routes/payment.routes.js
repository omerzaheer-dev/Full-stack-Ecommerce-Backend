import { paymentController } from "../controllers/paymentOrder.controller.js";
import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js"

const router = Router()
router.route("/checkout").post(jwtVerify,paymentController)
export default router