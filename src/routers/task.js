const express = require('express')
const Task = require('../models/task')
// const { findById } = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

// Posting

// router.post('/tasks',auth,async (req,res)=>{
//     const task = new Task(req.body)
//     try{
//         await task.save()
//         res.status(201).send(task)
//     }catch(error){
//         res.send(error)
//     }
//     // task.save().then(()=>{
//     //     res.status(201).send(task)
//     //     console.log(task)
//     // }).catch((error)=>{
//     //     res.send(error)
//     //     console.log(error)
//     // })
// })
router.post('/tasks',auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(error){
        res.send(error)
    }
})
//Reading  

// router.get('/tasks',async (req,res)=>{
//     try{
//       const tasks =  await Task.find({})
//        res.status(200).send(tasks)
//     }catch(error){
//         res.status(500).send(error)
//     }
//     // Task.find({}).then((tasks)=>{
//     //     res.status(200).send(tasks)
//     //     console.log(tasks)
//     // }).catch((error)=>{
//     //     //server is down
//     //     res.status(500).send(error)
//     //     console.log(error)
//     // })
// })
// router.get('/tasks',auth,async (req,res)=>{
//     try{
//         // console.log(req.user)
//         const tasks =  await Task.find({owner : req.user._id})
//         // await req.user.populate('tasks').execPopulate()
//         res.status(200).send(tasks)
//     }catch(error){
//         res.status(500).send(error)
//     }
// })

// router.get('/tasks/:id',async (req,res)=>{
//     try{
//         const task = await Task.findById(req.params.id)
//         if(!task)
//             return res.status(404).send()
//         res.status(200).send(task)
//     }catch(error){
//         res.status(500).send(error)
//     }
//     // Task.findById(req.params.id).then((task)=>{
//     //     if(!task)
//     //         return res.status(404).send()
//     //     res.status(200).send(task)
//     //     console.log(task)
//     // }).catch((error)=>{
//     //     //server is down
//     //     res.status(500).send(error)
//     //     console.log(error)
//     // })
// })

// Patching
router.get('/tasks/:id' ,auth,async (req,res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id , owner : req.user._id})
        if(!task)
            return res.status(404).send()
        res.status(200).send(task)
    }catch(error){
        res.status(500).send(error)
    }
})
// router.patch('/tasks/:id',async(req , res)=>{
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['description' , 'completed']
//     const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
//     if(! isValidOperation){
//         return res.status(400).send({error : "Invalid update value"})
//     }
//     try{
//         // const task =await Task.findByIdAndUpdate(req.params.id,req.body,{new : true , runValidators : true})
//         const task = await Task.findById(req.params.id)
//         updates.forEach((update)=>task[update] = req.body[update])
//         await task.save()
        
//         if(!task){
//             return res.status(404).send()
//         }
//         res.status(201).send(task)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })
router.patch('/tasks/:id',auth,async(req , res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description' , 'completed']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if(! isValidOperation){
        return res.status(400).send({error : "Invalid update value"})
    }
    try{
        // const task =await Task.findByIdAndUpdate(req.params.id,req.body,{new : true , runValidators : true})
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id:req.params.id , owner:req.user._id})
        if(!task)
            return res.status(404).send()
        updates.forEach((update)=>task[update] = req.body[update])
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

// delete 

// router.delete('/tasks/:id',async(req , res)=>{
//     try{
//         const task =await Task.findByIdAndDelete(req.params.id)
//         if(!task){
//             return res.status(404).send()
//         }
//         res.status(201).send(task)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })
router.delete('/tasks/:id',async(req , res)=>{
    try{
        const task =await Task.findOneAndDelete({_id:req.params.id , owner : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

// get /tasks/completed=true
router.get('/tasks',auth,async (req,res)=>{
    let IsCompleted = false 
    let sort = {}
    if(req.query.completed ==='true')
        IsCompleted = true
    
    if(req.query.sortedBy){
        const parts = req.query.sortedBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        // console.log(req.user)
        const tasks =  await Task.find({owner : req.user._id , completed:IsCompleted}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sort)
        // await req.user.populate('tasks').execPopulate()
        res.status(200).send(tasks)
    }catch(error){
        res.status(500).send(error)
    }
})

module.exports = router