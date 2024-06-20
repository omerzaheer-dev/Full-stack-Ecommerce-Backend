import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    Role:String,
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture:{
        type: String,
        default: ""
    },
    refreshToken:[String]
    
},{
    timestamps:true
})

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordValid = async function (password) {

    return await bcrypt.compare(password , this.password);
};

userSchema.methods.generateAcessToken = function (){
    return Jwt.sign(
        {
            _id: this.id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: 10
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    return Jwt.sign(
        {
            _id: this.id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: 60
        }
    )
}

export const User = mongoose.model("User", userSchema)