const mongoose=require("mongoose");
getConnection = async () => {
    await mongoose.connect("mongodb://localhost:27017/UserDetails",{
    }).then(()=>{
        console.log(`Database connection successful`);
    }).catch((err)=>{
        console.log(`Couldn't connect to database`);
        console.log(err);
    });
}
getConnection();