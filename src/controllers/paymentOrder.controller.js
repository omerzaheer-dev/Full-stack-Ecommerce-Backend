import { stripe } from "../utils/stripe.payment.js";
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { Cart } from "../models/cart.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const paymentController = asyncHandler(async (req,res) => {
    const { email } = req?.user
    const {cartItems} = req.body
    const options = {
        submit_type: "pay",
        mode: 'payment',
        billing_address_collection:'auto',
        payment_method_types:["card"],
        shipping_options:[
            {
                shipping_rate:"shr_1PlUHw027ZaOTg8glX74FGRS"
            }
        ],
        customer_email: email,
        line_items:
            cartItems.map((item,index)=>{
                return {
                    price_data: {
                        currency:'pkr',
                        product_data:{
                            name:item?.productId?.productName,
                            images:item?.productId?.productImage,
                            metadata:{
                                productId:item?.productId?._id
                            }
                        },
                        unit_amount:item?.productId?.sellingPrice*100
                    },
                    adjustable_quantity:{
                        enabled:true,
                        minimum:1
                    },
                    quantity:item?.quantity
                }
            }),
            success_url:`${process.env.CORS_ORIGIN}/success`,
            cancel_url:`${process.env.CORS_ORIGIN}/cancel`,
    }
    const session = await stripe.checkout.sessions.create(options);

    return res
        .status(200)
        .json(
            new ApiResponse(200,session,"Product added to Cart")
        )

})
const endpointSecret = process.env.END_POINT_SECRET;
const webHook = asyncHandler(async (req,res) => {
    const sig = request.headers['stripe-signature'];
    const payloadString = JSON.stringify(req.body)
    let event;
    try {
        event = stripe.webhooks.constructEvent(payloadString, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,session,"Product added to Cart")
        )

})
export {
    paymentController
}