import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js" 
import jwt from "jsonwebtoken"

const jwtVerify = async (req ,res, next) => {
    try {
        const Token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
        if(!Token){
            return res.status(401).json(new ApiError(401,"Token not available"))
        }
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken){
        return res.status(401).json(new ApiError(401,"Invalid Token"))
        }
        const user = await User.findById(decodedToken?._id).select("-password")
        if(!user){
            return res.status(401).json(new ApiError(409,"Token is expired"))
        }
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json(new ApiError(401, error.message || "invalid access token"))
    }
}
const IsAdmin = async (req ,res, next) => {
    try {
        const userRole = req.user.Role;
        if(userRole!=="ADMIN"){
        return res
        .status(409)
        .json(
                new ApiError(409,"User Role is not Admin")
            )
        }
        next()
    } catch (error) {
        return res.status(401).json(new ApiError(401, error.message || "something went wrong"))
    }
}
export {
    jwtVerify,
    IsAdmin
}