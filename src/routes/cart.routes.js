import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js"
import { addToCartProduct , productsInCart , viewCartProducts , updateAddToCartProducts } from "../controllers/cart.controller.js"

const router = Router()
router.route("/add-toCart").post(jwtVerify,addToCartProduct)
router.route("/get-cart-products").get(jwtVerify,productsInCart)
router.route("/view-cart-products").get(jwtVerify,viewCartProducts)
router.route("/update-addToCart").patch(jwtVerify,updateAddToCartProducts)
export default router