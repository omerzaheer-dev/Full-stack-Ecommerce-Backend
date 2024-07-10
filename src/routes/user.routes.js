import { Router } from "express";
import { registerUser , loginUser ,userDetails , delusr ,logoutUser  } from "../controllers/user.controller.js"
import { jwtVerify  } from "../middlewares/auth.middleware.js" 
import { upload } from "../middlewares/multer.middleware.js";
import { refreshAccessToken } from "../middlewares/refreshAccessToken.middleware.js"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profilePicture",
            maxCount: 1
        },
    ]),
    registerUser)
router.route("/login").post(loginUser)
router.route("/userdetails").get(jwtVerify,userDetails)
router.route("/logout").get(logoutUser)
router.route("/usrdel").delete(delusr)

//secured routes
// router.route("/logout").post(verifyJWT,  logoutUser)
// router.route("/refresh-token").post(refreshAccessToken)
// router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// router.route("/current-user").get(verifyJWT, getCurrentUser)
// router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
// router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
// router.route("/history").get(verifyJWT, getWatchHistory)

export default router