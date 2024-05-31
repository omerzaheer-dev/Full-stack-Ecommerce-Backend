import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true,
        trim: true,
    },
    price:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true,
        trim: true,
    },
    productImage:[
        {
            type: String,
            trim: true,
        }
    ],
    brand:{
        type: String,
        required: true,
        trim: true,
    },
    category:{
        type: String,
        required: true,
        trim: true,
    },
    sellingPrice:{
        type: Number,
        required: true,
    }
},{
    timestamps:true
})

export const Product = mongoose.model("Product",productSchema)