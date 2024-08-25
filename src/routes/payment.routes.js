import { paymentController ,webHook , orderList } from "../controllers/paymentOrder.controller.js";
import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js"

const router = Router()
router.route("/checkout").post(jwtVerify,paymentController)
router.route("/webhook").post(webHook)
router.route("/order-list").get(jwtVerify,orderList)
export default router