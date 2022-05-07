const express=require('express');
const app=express();
const path = require('path'); 
const bcrypt=require('bcryptjs');
db_path=path.join( __dirname,'/db/connection');
//console.log(db_path);
const port=process.env.PORT||3000;
const db=require(db_path);
schema_path=path.join( __dirname,'/registration_schema');
const Register=require(schema_path);
var flag=0;// User has not yet visited home page

// For capturing the data submitted via the form
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(express.static('../public'));
static_files_path=path.join( __dirname,'../views');
app.set('view-engine','ejs');
app.set("views",static_files_path);


app.get('/login',(req,res)=>{
    if(flag==1){
       return res.redirect('/index');
    }
    res.render('login.ejs');
});

app.get('/register',(req,res)=>{
    if(flag==1){
        return res.redirect('/index');
    }
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
                else{
                    res.render('register.ejs',{message:'Error in connecting to database!'});
                }
                // Some other error
                // return res.status(500).send(err);
              }
            else{
                return res.status(201).redirect('/login');
            }
        });
    } catch (error) {
        res.render('register.ejs',{message:'Error in connecting to database!'});
    }
});


// Login check
app.post('/login',async(req,res)=>{
    try {
        const username=req.body.username;
        const password=req.body.password;

        const userdetails= await Register.findOne({username:username});

        // Compare the hashed form of the password entered by the user and the hashed password stored in the database
        const compare_hash=await bcrypt.compare(password,userdetails.password);
        if(compare_hash){
            flag=1;
            return res.status(201).redirect('/index');
            // To prevent user from accessing home page again after visiting login or register routes
        }
        else{
            res.render('login.ejs',{message:'Incorrect username/password!'});
        }
    } catch (error) {
        res.render('login.ejs',{message:'Incorrect username/password!'});
    }
});

app.get('/index',(req,res)=>{
    if(flag==1){
        return res.render('index.ejs');
    }
    res.redirect('/login');
});

//User clicks on logout button
app.post('/logout',(req,res)=>{
    flag=0;
    req.body.password="";
    res.redirect('/login')
});
app.listen(port);