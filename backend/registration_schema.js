const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const userSchema= new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type: String,
        required:true,
        unique:true
    },
    username: {
        type: String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required:true,
    },
    location:{
        type: String,
        required:false
    },
    travel_date:{
        type:String,
        required:false
    },
    notes:{
        id:String,
        notes_instance:String,
        required:false
    }
})

//Middleware for password hashing before save method is called in the server
userSchema.pre("save",async function(next){
    this.password=await bcrypt.hash(this.password,10);
    next(); //To resume execution
});
// Creating a collection
const Register= new mongoose.model("Register",userSchema);
module.exports=Register;