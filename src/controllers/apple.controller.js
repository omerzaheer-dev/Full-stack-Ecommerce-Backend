import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const parsing = asyncHandler(async (req,res) => {
    const {parse} = req.body
    console.log("pa",parse)
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"message")
    )
})
export {
    parsing
}