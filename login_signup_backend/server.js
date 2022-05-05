const express=require('express');
const app=express();
const path = require('path'); 
db_path=path.join( __dirname,'/db/connection');
//console.log(db_path);
const port=process.env.PORT||3000;
const db=require(db_path);
schema_path=path.join( __dirname,'/registration_schema');
const Register=require(schema_path);

// For capturing the data submitted via the form
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(express.static('../public'));
static_files_path=path.join( __dirname,'../views');
app.set('view-engine','ejs');
app.set("views",static_files_path);


app.get('/login',(req,res)=>{
    res.render('login.ejs');
});

app.get('/register',(req,res)=>{
    res.render('register.ejs');
});

// In order to create a new user in the database
app.post('/register',async(req,res)=>{
    try {
        const registerUser=new Register({
            name:req.body.name,
            email:req.body.email,
            username:req.body.username,
            password:req.body.password
        })
        const registered=registerUser.save(function(err){
            if(err){
                if(err.code===11000) {
                    // Check for duplicate username or email
                    //return res.status(500).send({success:false,message:'User already exists!'});
                    res.render('register.ejs',{message:'Username/email already exists!'});
                    //return res.send("Error!!!");
                }
                // Some other error
                // console.log("error2");
                // return res.status(500).send(err);
              }
            else{
                res.status(201).render('index.ejs');
            }
        });
    } catch (error) {
        res.status(400).send("Please enter the required fields correctly");
    }
});

// Login check
app.post('/login',async(req,res)=>{
    try {
        const username=req.body.username;
        const password=req.body.password;

        const userdetails= await Register.findOne({username:username});
        if(userdetails.password===password){
            res.status(201).render('index.ejs');
        }
        else{
            res.render('login.ejs',{message:'Incorrect username/password!'});
        }
    } catch (error) {
        res.render('login.ejs',{message:'Incorrect username/password!'});
    }
});

app.listen(port);