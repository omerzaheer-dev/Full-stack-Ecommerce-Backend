import { stripe } from "../utils/stripe.payment.js";
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { Cart } from "../models/cart.model.js";
import { OrderProduct } from "../models/orderProduct.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const paymentController = asyncHandler(async (req,res) => {
    const { email } = req?.user
    const id = req?.user?._id
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
        metadata:{
            userId:id.toString()
        },
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
const getLineItems = async (lineItems) => {
    const productItems = []
    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await stripe.products.retrieve(item?.price?.product)
            const productId = product?.metadata?.productId
            const productData = {
                productId,
                productName: product?.name,
                price:item.price.unit_amount/100,
                quantity:item?.quantity,
                image:product?.images
            }
            productItems.push(productData)
        }
    }
    return productItems
}
const webHook = asyncHandler(async (req,res) => {
    const endpointSecret = process.env.END_POINT_SECRET;
    const sig = req.headers['stripe-signature'];
    const payloadString = JSON.stringify(req.body);
    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: endpointSecret
    }) 
    let event;
    try {
        event = stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
    } catch (err) {
        console.log("event error")
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const lineItems = await stripe.checkout.sessions.listLineItems(session?.id)
          const productDetails = await getLineItems(lineItems);
          const orderDetails = {
            productDetails: productDetails,
            email:session?.customer_email,
            userId :session?.metadata.userId,
            paymentDetails:{
                paymentId:session?.payment_intent,
                payment_method_type:session?.payment_method_types,
                payment_status:session?.payment_status
            },
            shipping_options:session?.shipping_options?.map(s => {
                return {
                    ...s,shipping_amount:s.shipping_amount/100
                }
            }),
            totalAmount:session.amount_total/100
        }
        const order = await OrderProduct.create(orderDetails)
        const createdOrder = await OrderProduct.findById(order?._id)
        if( !createdOrder ){
            return res.status(402).json(
                new ApiError(402, "something went wrong while creating new order")
            )
        }
        break;
        default:
            console.log(`Unhandled event type ${event.type}`);
            res.status(200).end();
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Payment succeded")
        )

})
const orderList = asyncHandler(async (req,res) => {
    const userId = req?.user?._id;
    const orderList = await OrderProduct.find({ userId })
    if(!orderList){
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"No Order Yet")
        )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,orderList,"Your order is here")
        )
})
export {
    paymentController,
    webHook,
    orderList
}