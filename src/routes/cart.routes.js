import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js"
import { addToCartProduct , productsInCart } from "../controllers/cart.controller.js"

const router = Router()
router.route("/add-toCart").post(jwtVerify,addToCartProduct)
router.route("/cart").get(jwtVerify,productsInCart)
export default router