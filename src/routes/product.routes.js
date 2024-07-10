import { Router } from "express";
import { jwtVerify , IsAdmin  } from "../middlewares/auth.middleware.js"
import { uploadProducts , getAllProducts , updateProduct , getCategoryProduct , getOneCategoryProduct  } from "../controllers/products.controller.js" 
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/upload-products").post(jwtVerify,IsAdmin,upload.array('productImages'),uploadProducts)
router.route("/get-all-products").get(getAllProducts)
// router.route("/delete-product-image").get(imageTobeDel)
router.route("/update-Products").patch(jwtVerify,IsAdmin,upload.array('productImages'),updateProduct)
router.route("/get-categoryProduct").get(getCategoryProduct)
router.route("/get-one-categoryProduct").post(getOneCategoryProduct)

export default router