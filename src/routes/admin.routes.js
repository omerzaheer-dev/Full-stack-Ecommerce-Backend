import { Router } from "express";
import { jwtVerify , IsAdmin  } from "../middlewares/auth.middleware.js" 
import { allUsers , updateUserRole , allOrders } from "../controllers/admin.controller.js"
import { refreshAccessToken } from "../middlewares/refreshAccessToken.middleware.js"
const router = Router()

router.route("/all-users").get(refreshAccessToken,jwtVerify,allUsers)
router.route("/all-orders").get(jwtVerify,IsAdmin,allOrders)
router.route("/update-user-role").patch(jwtVerify,IsAdmin,updateUserRole)

export default router