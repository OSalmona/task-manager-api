const mongoose = require("mongoose")
 
mongoose.connect(process.env.MONGODB_URL)
// /users/osalm/mongodb/bin/mongod.exe --dbpath=/users/osalm/mongodb-data