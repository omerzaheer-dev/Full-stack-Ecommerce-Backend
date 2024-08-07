import { Router } from "express";
import { jwtVerify , IsAdmin  } from "../middlewares/auth.middleware.js"
import { uploadProducts , getAllProducts , updateProduct , getCategoryProduct , getOneCategoryProduct , getProductDetail , searchProducts, filterProducts  } from "../controllers/products.controller.js" 
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/upload-products").post(jwtVerify,IsAdmin,upload.array('productImages'),uploadProducts)
router.route("/get-all-products").get(getAllProducts)
// router.route("/delete-product-image").get(imageTobeDel)
router.route("/update-Products").patch(jwtVerify,IsAdmin,upload.array('productImages'),updateProduct)
router.route("/get-categoryProduct").get(getCategoryProduct)
router.route("/get-one-categoryProduct").post(getOneCategoryProduct)
router.route("/get-productDetails").post(getProductDetail)
router.route("/search-products").get(searchProducts)
router.route("/filter-products").post(filterProducts)

export default router