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
      return res
        .status(200)
        .json(
            new ApiResponse(200,newCart,"Product added to Cart")
        )
    }
    const productExists = cart.products.some(item => item.productId.toString() === productId);
    if (productExists) {
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { products: { productId: productId } } },
            { new: true }
        );
        return res
        .status(200)
        .json(
            new ApiResponse(200,updatedCart,"Product removed from cart")
        )
    }

    cart.products.push({ productId, quantity: 1 });
    await cart.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200,cart,"Product added to Cart")
        )

})
const productsInCart = asyncHandler(async (req,res) => {
    const userId = req.user
    const cart = await Cart.findOne({ userId });
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
export {
    addToCartProduct,
    productsInCart
}