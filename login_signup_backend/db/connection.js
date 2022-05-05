const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/UserDetails",{
    
}).then(()=>{
    console.log(`Database connection successful`);
}).catch((err)=>{
    console.log(`Couldn't connect to database`);
    console.log(err);
});