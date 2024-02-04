const mongoose = require("mongoose")
const validator  = require('validator')
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const UserSchema = new mongoose.Schema({
    name :{
        type : String
    },
    email :{
        type : String,
        required : true,
        unique : true,
        trim:true,
        lowercase : true,
        validate(value){
            if(! validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    age:{
        type : Number ,
        default : 0
    },
    password :{
        type : String ,
        required : true , 
        trim : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Pasword can not contain 'password'")
            }
        }

    },
    tokens : [{
       token:{
        type : String ,
        required : true
       } 
    }],
    avatar : {
       type : Buffer
    }
},{
    timestamps : true
}
)
UserSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

UserSchema.pre('save' ,async function (next){
    const user = this 
    // console.log(this)
    // true if user password have a new value otherwise false
    if(user.isModified('password')){
        user.password = await bycrypt.hash(user.password , 8)
    }
    next()
})
UserSchema.statics.findByCredentials = async(email , password)=>{
    const user = await User.findOne({email})
    if(!user)
        throw new Error('Unable to login email is wrong')
    const isMatch = await bycrypt.compare(password , user.password)
    if(!isMatch)
        throw new Error('Unable to login password is wrong')
    return user
}
UserSchema.methods.generateAuthToken = async function(){
    // console.log("fds")
    const user = this
    const token = jwt.sign({_id: user._id.toString()},'thisismynewcourse')
    // console.log(token)
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}
UserSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject
}
// remove user tasks when user is removed
UserSchema.pre('remove',async function(next){
    const user = this
    Task.deleteMany({owner :user._id})
    next()
})
const User = mongoose.model('User' ,UserSchema)

module.exports = User;






// const usr = new User({
//     name : "user 4" , 
//     email: "user1@gmail.com",
//     password : "    abcsefdgdsfre32"
// })
// usr.save().then((result)=>{
//     // console.log(usr);
//     console.log(result);
// }).catch((error)=>{
//     console.log(error)
// })
