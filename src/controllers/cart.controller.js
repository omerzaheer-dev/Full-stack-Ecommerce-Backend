import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { Cart } from "../models/cart.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const addToCartProduct = asyncHandler(async (req,res) => {
    const userId = req?.user?._id;
    const { productId  } = req.body;
    if(!userId){
        return res
        .status(401)
        .json(
                new ApiError(401,"User is not present")
            ) 
    }
    const cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId)
    if(!product){
        return res
        .status(401)
        .json(
                new ApiError(401,"Product you are trying to add in cart not available")
            )
    }
    if (!cart) {
      const newCart = new Cart({ userId, products: [{ productId }] });
      await newCart.save();
      const kart = await Cart.findOne({ userId }).populate('products.productId').select('-userId');
      return res
        .status(200)
        .json(
            new ApiResponse(200,kart,"Product added to Cart")
        )
    }
    const productExists = cart.products.some(item => item.productId.toString() === productId);
    if (productExists) {
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { products: { productId: productId } } },
            { new: true }
        );
        const sentUpdatedCart = await Cart.findOne({ userId }).populate('products.productId').select('-userId');
        return res
        .status(200)
        .json(
            new ApiResponse(200,sentUpdatedCart,"Product removed from cart")
        )
    }

    cart.products.push({ productId, quantity: 1 });
    await cart.save();
    const caart = await Cart.findOne({ userId }).populate('products.productId').select('-userId')

    return res
        .status(200)
        .json(
            new ApiResponse(200,caart,"Product added to Cart")
        )

})
const productsInCart = asyncHandler(async (req,res) => {
    const userId = req.user
    const cart = await Cart.findOne({ userId }).populate('products.productId').select('-userId');;
    if(!cart){
        const Cart = await Cart.create({
            userId,
            products: []
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200,Cart,"Cart Returned")
        )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,cart,"Cart Returned")
        )
})
const viewCartProducts = asyncHandler(async (req , res) => {
    const userId = req?.user?._id;
    if(!userId){
        return res
        .status(402)
        .json(
                new ApiError(401,"User is not present")
            ) 
    }
    const cart = await Cart.findOne({
        userId
    }).populate('products.productId').select('-userId');
    if(!cart){
        return res
        .status(402)
        .json(
                new ApiError(401,"Cart is not defined")
            )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,cart,"Product removed from cart")
        )
})
const updateAddToCartProducts = asyncHandler(async (req , res) => {
    const userId = req?.user?._id;
    const {_id,qty,type} = req?.body;
    if(type==='dec' && qty===1){
        return res
        .status(402)
        .json(
                new ApiError(401,"cannot decrement")
            )
    }
    if(!userId || !_id || !qty){
        return res
        .status(402)
        .json(
                new ApiError(401,"All fiels are required")
            )
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        return res
        .status(402)
        .json(
                new ApiError(401,"Cart not Found")
            )
    }
    const product = cart.products.find(p => p.productId.toString() === _id);
    if (!product) {
        return res
        .status(402)
        .json(
                new ApiError(401,"product not found")
            )
    }
    if(type==='dec'){
        product.quantity = qty-1;
    }
    if(type==='inc'){
        product.quantity = qty+1;
    }
    await cart.save();
    return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Cart updated successfully")
        )
})
export {
    addToCartProduct,
    productsInCart,
    viewCartProducts,
    updateAddToCartProducts
}