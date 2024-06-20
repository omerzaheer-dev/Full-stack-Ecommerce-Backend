import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js" 
import jwt from "jsonwebtoken"

const jwtVerify = async (req ,res, next) => {
    try {
        const Token = req.cookies?.Accesstoken || req.header("Authorization")?.replace("Bearer ", "")
        if(!Token){
            return res.status(400).json(new ApiError(400,"Token not available"))
        }
        jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET ,async (err,decoded) => {
            if (err) {
                return res.status(402).json(new ApiError(402,"Invalid Token"))
            }
            const user = await User.findById(decoded._id).select("-password")
            if(!user){
                return res.status(403).json(new ApiError(403,"Token is expired"))
            }
            req.user = user
            next()
        })
    } catch (error) {
        return res.status(409).json(new ApiError(409,"invalid access token"))
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
        return res.status(401).json(new ApiError(401,"something went wrong"))
    }
}
export {
    jwtVerify,
    IsAdmin
}