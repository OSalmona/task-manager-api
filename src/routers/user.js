const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const { sendWelcomeEmail , sendCancellationEmail} = require('../emails/account')


router.post('/users', async (req,res)=>{
    
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email , user.name)
        const token = await user.generateAuthToken()
        res.status(200).send({user})

    }catch(error){
        res.status(400).send(error)
    }
    // user.save().then(()=>{
    //     res.send(user)
    //     console.log(user)
    // }).catch((error)=>{
    //     res.send(error)
    //     console.log(error)
    // })
})
router.post('/users/login' , async(req , res)=>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        // console.log(user.getPublicProfile())
        // console.log(user)
        res.send({user ,token })
        // res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})
// we need to make authentication in login or in post user
////////////////////////////////////////////////////////
router.get('/users/me' ,auth ,async(req,res)=>{
    res.status(200).send(req.user)
})
router.get('/users' ,async(req,res)=>{
    try{
       const users = await User.find({})
        res.status(200).send(users)
    }catch(error){
        res.status(500).send(error)
    }
    // User.find({}).then((users)=>{
    //     res.status(200).send(users)
    //     console.log(users)
    // }).catch((error)=>{
    //     //server is down
    //     res.status(500).send(error)
    //     console.log(error)
    // })
})
router.get('/users/:id',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user)
            return res.status(404).send()
        res.status(200).send(user)
    }catch(error){
        res.status(500).send(error)
    }
    // User.findById(req.params.id).then((user)=>{
    //     if(!user)
    //         return res.status(404).send()
    //     res.status(200).send(user)
    //     console.log(user)
    // }).catch((error)=>{
    //     //server is down
    //     res.status(500).send(error)
    //     console.log(error)
    // })
})
// router.patch('/users/:id',async(req , res)=>{
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name' , 'email' , 'password' , 'age']
//     const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
//     if(! isValidOperation){
//         return res.status(400).send({error : "Invalid update value"})
//     }

//     try{
//         // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new : true , runValidators : true})
//         const user = await User.findById(req.params.id)
//         updates.forEach((update)=>{user[update] = req.body[update]})
//         await user.save()
//         if(!user){
//             return res.status(404).send()
//         }
//         res.status(201).send(user)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })
// router.delete('/users/:id',async(req , res)=>{
//     try{
//         const user = await User.findByIdAndDelete(req.params.id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.status(201).send(user)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })
router.post('/users/logout',auth, async (req , res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send({msg : 'logout'})
    }catch(e){
        res.status(500).send()
    }
})
router.post('/users/logoutAll',auth, async (req , res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({msg : 'logout'})
    }catch(e){
        res.status(500).send()
    }
})
router.delete('/users/me' ,auth,async(req , res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
       await User.deleteOne({_id : req.user._id})
       sendCancellationEmail(req.user.email , req.user.name)
         res.status(201).send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})
router.patch('/users/me',auth , async(req , res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name' , 'email' , 'password' , 'age']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if(! isValidOperation){
        return res.status(400).send({error : "Invalid update value"})
    }

    try{
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new : true , runValidators : true})
        const user = req.user
        updates.forEach((update)=>{user[update] = req.body[update]})
        await user.save()
        if(!user){
            return res.status(404).send()
        }
        res.status(201).send(user)
    }catch(e){
        res.status(400).send(e)
    }
})
///////// Avatar
const sharp = require('sharp')
const multer = require('multer')
const upload = multer({
    // dest : 'avatars',
    storage : multer.memoryStorage(),
    limits:{
        fileSize : 1000000
    },
    fileFilter(req , file , cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a word document'))
        }
        cb(undefined , true)
    }
})

router.post('/users/me/avatar' ,auth ,  upload.single('avatarPic') , async(req , res) =>{
    const buffer = await sharp(req.file.buffer).resize({width : 200 , height : 200}).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    // console.log(req.file.buffer)
    res.send(req.user)
},(error , req , res , next)=>{
    res.status(400).send({error :  error.message})
})
router.delete('/users/me/avatar' , auth , async(req, res)=>{
    try{
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send(req.user)
    }catch(error){
        res.status(400).send(error)
    }
})
router.get('/users/:id/avatar' , async(req , res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(error){
        res.status(404).send()
    }
})


module.exports = router;