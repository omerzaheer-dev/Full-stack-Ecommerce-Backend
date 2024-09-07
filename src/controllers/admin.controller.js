import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { OrderProduct } from "../models/orderProduct.model.js";

const allUsers = asyncHandler( async ( req , res ) => {
    const Users = await User.find()
    if( !Users ){
        return res
        .status(400)
        .json(
            new ApiError(400,"no user found")
        )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    Users
                },
                "all users fetched"
            )
        )
} )

const updateUserRole = asyncHandler( async ( req , res ) => {
    const { email , Role } = req.body
    const prevUser = await User.findOne({email})
    if(!prevUser){
    return res
    .status(402)
    .json(
            new ApiError(402,"no user found")
        )
    }
    if(!Role){
    return res
    .status(400)
    .json(
            new ApiError(400,"User Role is not present in data")
        )
    }
    if(!(Role === "GENERAL" || Role === "ADMIN")){
    return res
    .status(401)
    .json(
            new ApiError(401,"Please provide valid Role")
        )
    }
    if(prevUser.Role===Role){
    return res
    .status(401)
    .json(
            new ApiError(401,"User Role is same as previous")
        )
    }
    const updatedUser = await User.findOneAndUpdate({email},{
        Role
    },{
        new:true
    })
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    updatedUser
                },
                "user role updated"
            )
        )
} )

const allOrders = asyncHandler( async ( req , res ) => {
    try {
        const orderList = await OrderProduct.find().sort({createdAt:-1})
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        orderList
                    },
                    "all users fetched"
                )
            )
    } catch (error) {
        return res
        .status(406)
        .json(
            new ApiError(406,"Something went wrong")
        )
    }
} )
export {
    allUsers,
    updateUserRole,
    allOrders
}