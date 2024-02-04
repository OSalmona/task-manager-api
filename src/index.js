// npm run dev
const dbConnection = require('./db/mongoose')
const express = require('express')
const router = new express.Router()
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(router)
app.use(userRouter)
app.use(taskRouter)

app.listen(port , ()=>{
    console.log("server is up on port "+port)
})

// const multer = require('multer')
// const upload = multer({
//     dest : 'images',
//     limits:{
//         fileSize : 1000000
//     },
//     fileFilter(req , file , cb){
//         // !file.originalname.endsWith('.pdf')
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error('Please upload a word document'))
//         }
//         cb(undefined , true)
//     }
// })

// app.post('/upload',upload.single('upload'),(req,res)=>{
//     res.send()
// },(error , req , res , next)=>{
//     res.status(400).send({error :  error.message})
// })
