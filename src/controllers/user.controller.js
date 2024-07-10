import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const registerUser = asyncHandler( async (req , res) => {
    const { name , email , confirmPassword , password  } = req.body
    if (!name || !email || !password || !confirmPassword) {
        return res.status(401).json(
            new ApiError(401, "All fields are required")
        )
    }
    const existedUser = await User.findOne({ email })
    if (existedUser) {
        return res.status(401).json(
            new ApiError(401, "User already exists ")
        )
    }
    if(password !== confirmPassword){
        return res.status(409).json(
            new ApiError(409, "password and confirm password doesn't match ")
        )
    }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
        coverImageLocalPath = req.files.profilePicture[0].path
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath,"profiles")
    const user = await User.create({
        name,
        email,
        password,
        profilePicture: coverImage?.secure_url || "",
        Role:"GENERAL"
    })
    const createdUser = await User.findById(user._id).select("-password")
    if( !createdUser ){
        return res.status(402).json(
            new ApiError(402, "something went wrong while creating new user")
        )
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser , "User registered successfully")
    )

} )

const loginUser = asyncHandler( async (req , res) => {
    const { email , password } = req.body;
    if(!email || !password){
        return res.status(401).json(
            new ApiError(401, "All fields are required")
        )
    }
    const user = await User.findOne({ email });
    if(!user){
        return res.status(401).json(
            new ApiError(401, "User with this email doesn't exists")
        )
    }
    const isPasswordMatched = await user.isPasswordValid(password)
    if(!isPasswordMatched){
        return res.status(401).json(
            new ApiError(401, "Invalid credentials")
        )
    }
    const cookies = req.cookies;
    const Accesstoken = user.generateAcessToken();
    const newRefreshtoken = user.generateRefreshToken();
    const options = {
        httpOnly:true,
        secure:true,
        sameSite: 'None'
    }
    let newRefreshTokenArray = !cookies?.Refreshtoken  ? user.refreshToken : user.refreshToken.filter(rt => rt !== cookies.Refreshtoken);

    if (cookies?.Refreshtoken) {
        res.clearCookie('Refreshtoken', { httpOnly: true, sameSite: 'None', secure: true });
    }
    user.refreshToken = [...newRefreshTokenArray, newRefreshtoken];
    const result = await user.save({ validateBeforeSave: false });

    const usernow = await User.findById(user._id).select("-password")
    if(!usernow){
        return res.status(401).json(
            new ApiError(401, "User with this email doesn't exists")
        )
    }
    return res.status(200)
    .cookie("Accesstoken",Accesstoken,options)
    .cookie("Refreshtoken",newRefreshtoken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:usernow
            },
            "User logged in successfully"
        )
    )
} )

const userDetails = asyncHandler( async (req , res) => {
    const user = await User.findById(req.user?._id)
    if(!user){
        return res.status(401)
        .json(
            new ApiError(401,"user not present")
        )
    }
    return res.status(200)
        .json(
            new ApiResponse(200,{
                user
            },"user details fetched successfully")
        )
} )

const logoutUser = asyncHandler( async (req , res) => {
    const cookies = req.cookies;
    if (!cookies?.Refreshtoken){
        return res.status(401)
        .json(
            new ApiError(401,"refreshToken not present")
        )
    }
    const refreshToken = cookies?.Refreshtoken;
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('Refreshtoken', { httpOnly: true, sameSite: 'None', secure: true });
        res.clearCookie('Accesstoken', { httpOnly: true, sameSite: 'None', secure: true });
        return res.status(401)
        .json(
            new ApiError(401,"user not found")
        )
    }
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);;
    const result = await foundUser.save({ validateBeforeSave: false });
    const options = {
        httpOnly : true,
        secure : true
    }
    res
    .clearCookie("Accesstoken",options)
    .clearCookie("Refreshtoken",options)
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"user logged out successfully")
    )
} )

const delusr = asyncHandler(async (req , res) => {
    const user = await User.deleteMany()
    return res.status(200).json(
        new ApiResponse(200,{},"user seex")
    )
})

export {registerUser,loginUser,userDetails,delusr,logoutUser,}