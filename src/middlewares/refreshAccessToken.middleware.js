import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js" 
import jwt from "jsonwebtoken"

const refreshAccessToken = async (req ,res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.Refreshtoken) return res.status(402).json(new ApiError(401,"invalid"))
        const refreshToken = cookies?.Refreshtoken;
        const accessToken = cookies?.Accesstoken;
        const foundUser = await User.findOne({ refreshToken }).exec();
        if(!foundUser){
            return res.status(406).json(new ApiError(406,"invalid access"))
        }
        // const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken)
        jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
            if(err){
                return res.status(406).json(new ApiError(406,"invalid access token"))
            }
            if(decoded?.email !== foundUser.email){
                return res.status(401).json(new ApiError(401,"invalid access token1"))
            }
            jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
                if(err){
                    const Accesstoken = foundUser.generateAcessToken();
                    res.cookie('Accesstoken', Accesstoken, { httpOnly: true, secure: true, sameSite: 'None'});
                    next()
                }
                next()
            })
        })
    } catch (error) {
        return res.status(406).json(new ApiError(406,"invalid access token3"))
    }
}
export {
    refreshAccessToken
}