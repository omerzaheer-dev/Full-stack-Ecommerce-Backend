import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js"
import { uploadOnCloudinary , deleteImageByPublicId } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const uploadProducts = asyncHandler( async ( req , res ) => {
    const { productName, price , description , brand , category ,sellingPrice } = req.body
    if( !productName || !price || !description || !brand || !category || !sellingPrice ){
        return res.status(402).json(
            new ApiError(402, "All feilds are required")
        )
    }

    console.log("file",req.files)
    const productImages = req.files
    // console.log("productImages",productImages)
    if(!productImages){
        return res.status(402).json(
            new ApiError(402, "At least 1 image is required")
        )
    }
    const mineTypeAndSizeValidation = productImages.map(pi => {
        if(!(pi.mimetype.startsWith("video/") || pi.mimetype.startsWith("image/"))){
            return res.status(400).json(
                new ApiError(400, "file should be video or image")
            )
        }
        if(pi.mimetype.startsWith("video/") && pi.size>12582912){
            return res.status(400).json(
                new ApiError(400, "video should be not more than 12 mbs")
            )
        }
        if(pi.mimetype.startsWith("image/") && pi.size>3145728){
            return res.status(400).json(
                new ApiError(400, "photo should not be more than 3 mbs")
            )
        }
    })
    const categories = [
        "airpods",
        "camera",
        "earphone",
        "mobile",
        "mouse",
        "printer",
        "processor",
        "refrigerator",
        "speaker",
        "trimmer",
        "television",
        "watches"
      ]

    if (!categories.includes(category)) {
        return res.status(402).json(
            new ApiError(402, "category is invalid")
        )
    }
    const productExist = await Product.findOne({
        productName
    })
    if(productExist){
        return res.status(409).json(
            new ApiError(409, "Product already exists")
        )
    }
    const result = await Promise.all(productImages.map(file => {
        return uploadOnCloudinary(file.path,"product")
      }));

    const newProduct = await Product.create({
        productName,
        price,
        description,
        brand,
        category,
        sellingPrice,
        productImage:result.map((response)=>response.secure_url)
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    newProduct
                },
                "Product created successfully"
            )
        )
} )

const getAllProducts = asyncHandler( async ( req , res ) => {
    const products = await Product.find().sort({ createdAt : -1 })
    if( !products ){
        return res.status(402).json(
            new ApiError(402, "No product found")
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products
            },
            "Products fetched successfully"
        )
    )
} )

const updateProduct = asyncHandler(async (req, res) => {
    const { productName, orignalProductName, price, description, brand, category, sellingPrice, removePreviousImagesUrl } = req.body;

    if (!productName ||!price ||!description ||!brand ||!category ||!sellingPrice) {
        return res.status(402).json(new ApiError(402, "All fields are required"));
    }
    const productImages = req.files;

    
    const mineTypeAndSizeValidation = productImages.map(pi => {
        if(!(pi.mimetype.startsWith("video/") || pi.mimetype.startsWith("image/"))){
            return res.status(400).json(
                new ApiError(400, "file should be video or image")
            )
        }
        if(pi.mimetype.startsWith("video/") && pi.size>12582912){
            return res.status(400).json(
                new ApiError(400, "video should be not more than 12 mbs")
            )
        }
        if(pi.mimetype.startsWith("image/") && pi.size>3145728){
            return res.status(400).json(
                new ApiError(400, "photo should not be more than 3 mbs")
            )
        }
    })

    const categories = ["airpods", "camera", "earphone", "mobile", "mouse", "printer", "processor", "refrigerator", "speaker", "trimmer", "television", "watches"];

    if (!categories.includes(category)) {
        return res.status(402).json(new ApiError(402, "Category is invalid"));
    }

    let productExist = await Product.findOne({ productName: orignalProductName });
    if (!productExist) {
        return res.status(409).json(new ApiError(409, "Product does not already exist"));
    }

    let productImagesInObject = productExist.productImage;

    if (removePreviousImagesUrl!== "") {
        const split = removePreviousImagesUrl.split(",");
        const removePreviousImagesUrlArray = split.map((elem) => elem.trim()); // Ensure trimming to avoid empty strings

        if (removePreviousImagesUrlArray.length > 0 && Array.isArray(removePreviousImagesUrlArray)) {
            await Promise.all(removePreviousImagesUrlArray.map(async (url) => {
                const imgUrl = url;
                const urlArray = imgUrl.split('/');
                const publicId = `${urlArray[urlArray.length - 2]}/${urlArray[urlArray.length - 1].split(".")[0]}`;
                const deleteCloudinary = await deleteImageByPublicId(publicId);
                if (!deleteCloudinary) {
                    return res.status(402).json(new ApiError(402, "Image cannot be deleted"));
                } else {
                    productImagesInObject = productImagesInObject.filter(item => item!== url);
                }
            }));
        } else {
            console.error("removePreviousImagesUrl is not an array.");
        }
    }

    const result = await Promise.all(productImages.map((file) => {
        return uploadOnCloudinary(file.path,"product")
    }));
    const newImagesArray = result.map((response) => response.url);
    productImagesInObject.push(...newImagesArray);
    const newProduct = await Product.findOneAndUpdate(
        { productName: orignalProductName },
        {
            productName,
            price,
            description,
            brand,
            category,
            sellingPrice,
            productImage: productImagesInObject
        },
        { new: true }
    );

    return res
       .status(200)
       .json(new ApiResponse(200, { newProduct }, "Product updated successfully"));
});

const imageTobeDel = asyncHandler( async (req , res) => {
            const url = "https://res.cloudinary.com/dur5vi2mv/image/upload/v1716492052/product/ikzieubbanxdlbogqspw.webp";
            console.log("url",url)
            const urlArray = url.split('/');
            console.log("split result",urlArray)
            const publicId = `${urlArray[urlArray.length - 2]}/${urlArray[urlArray.length - 1].split(".")[0]}`;
            console.log("publicId", publicId);
            const deleteCloudinary = await deleteImageByPublicId(publicId);
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        deleteCloudinary
                    },
                    "Product updated successfully"
                )
            )
} )
export {
    uploadProducts,
    getAllProducts,
    updateProduct,
    imageTobeDel
}