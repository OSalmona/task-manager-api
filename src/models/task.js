const mongoose = require("mongoose")
const validator  = require('validator')

const TaskSchema = mongoose.Schema({
    description : {
        type : String,
        required : true,
        trim:true
    }, 
    completed:{
        type : Boolean ,
        default : false
    },
    owner :{
        type : mongoose.Schema.Types.ObjectId,
        requiresd : true,
        ref : 'User'
    }
},{
    timestamps : true
})
TaskSchema.pre('save' , async function(next){
    // const task = this
    // console.log("run before save or update task")
    next()
})
const Task = mongoose.model('Task' ,TaskSchema)

module.exports = Task





// const task = new Task({
//     description : "Task 2 description....." , 
//     // completed : false
// })
// task.save().then((result)=>{
//     // console.log(usr);
//     console.log(result);
// }).catch((error)=>{
//     console.log(error)
// })