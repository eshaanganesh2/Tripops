const express=require('express');
const app=express();
const path = require('path'); 
const bcrypt=require('bcryptjs');
require('dotenv').config({path:path.join(__dirname,"..",".env")});
db_path=path.join( __dirname,'/db/connection');
//console.log(db_path);
const port=process.env.PORT||3000;
const db=require(db_path);
schema_path=path.join( __dirname,'/registration_schema');
const Register=require(schema_path);
const nodemailer = require("nodemailer");
var inLineCss = require('nodemailer-juice');
var fs = require("fs");
var ejs = require("ejs");
const fetch = require('node-fetch');
const { getMaxListeners } = require('process');
var globalusername="";
var flag=0;// User has not yet visited home page

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var url="mongodb://localhost:27017";

// For capturing the data submitted via the form
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const bodyParser =require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('../public'));
static_files_path=path.join( __dirname,'../views');
app.set('view-engine','ejs');
app.set("views",static_files_path);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
app.get('/login',(req,res)=>{
    if(flag==1){
       return res.redirect('/index');
    }
    globalusername="";
    res.render('login.ejs');
});

app.get('/register',(req,res)=>{
    if(flag==1){
        return res.redirect('/index');
    }
    globalusername="";
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
                globalusername="";
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
            globalusername=username;
            flag=1;
            return res.status(201).redirect('/index');
            // To prevent user from accessing home page again after visiting login or register routes
        }
        else{
            globalusername="";
            res.render('login.ejs',{message:'Incorrect username/password!'});
        }
    } catch (error) {
        res.render('login.ejs',{message:'Incorrect username/password!'});
    }
});

app.get('/index',(req,res)=>{
    if(flag==1){
        return res.render('index.ejs',{access_token:process.env.MAPBOXGL_ACCESSTOKEN});
    }
    globalusername="";
    res.redirect('/login');
});

app.get('/news',(req,res)=>{
    if(flag==1){
        return res.render('news.ejs',{mapbox_access_token:process.env.MAPBOXGL_ACCESSTOKEN,newsapi_access_token:process.env.NEWSAPI_ACCESSTOKEN});
    }
    globalusername="";
    res.redirect('/login');
});

app.get('/weather_updates',(req,res)=>{
    if(flag==1){
        return res.render('weather_updates.ejs',{mapbox_access_token:process.env.MAPBOXGL_ACCESSTOKEN});
    }
    globalusername="";
    res.redirect('/login');
});

app.post('/weather_updates',async(req,res)=>{
    var loc=req.body.location;
    var date_travel=req.body.date;
    console.log(loc);
    console.log(globalusername);
    console.log(date_travel);
    // console.log(username===globalusername);
    try {
        const x=await Register.updateOne({"username":globalusername},{
            $set: {
                "location": loc,
                "travel_date":date_travel
            }
        });
        console.log(x)
    }
    catch(e){
        print(e);
    }

        var message="You have successfully subscribed for weather updates!";
        res.render("weather_updates.ejs",{mapbox_access_token:process.env.MAPBOXGL_ACCESSTOKEN,message:message});
});

app.get('/my_journal',async(req,res)=>{
    if(flag==1){
        const userdetails= await Register.findOne({username:globalusername});
        console.log(userdetails.notes);
        return res.render('my_journal.ejs',{notes_user:userdetails.notes});
    }
    globalusername="";
    res.redirect('/login');
});

// Handling POST request when user clicks 'save' for travel notes
app.post('/my_journal_posts',urlencodedParser,async(req,res)=>{
    var post=req.body.notes;
    post=post.replace(/'/g, '');
    try {
        function makeid(length) {
            var result='';
            var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength=characters.length;
            for(var i=0;i<length;i++){
              result+=characters.charAt(Math.floor(Math.random()*charactersLength));
            }
           return result;
        }
        var id=makeid(10);
        var consolidated_notes={id:id,notes_instance:post};
        // consolidated_notes.push(id);
        // consolidated_notes.push(post);
        const x=await Register.updateOne({"username":globalusername},{
            $push: {
                // "notes.id": "1",
                "notes": consolidated_notes
            }
        });
        console.log("hello");
    }
    catch(e){
        console.log(e);
    }
    const userdetails= await Register.findOne({username:globalusername});
    console.log(userdetails.notes);
    await sleep(2000);
    res.render('my_journal.ejs',{notes_user:userdetails.notes});
})

//Handling POST request when user clicks 'delete' button for a particular post
app.post('/my_journal_posts_delete',urlencodedParser,async(req,res)=>{
    const userdetails= await Register.findOne({username:globalusername});
    MongoClient.connect(url,async function(err,client){
    var db=client.db("UserDetails");
    console.log("Trial");
    var id=req.body.id;
    console.log(id);
    await db.collection('registers').updateOne(
        { "username": userdetails.username }, 
        { $pull:{notes:{id:id}}},
        false, // Upsert
        true, // Multi
    );
    });
    await sleep(1000);
    res.render('my_journal.ejs',{notes_user:userdetails.notes});
})

app.post('/my_journal_media',(req,res)=>{
    res.send("media");
})

//User clicks on logout button
app.post('/logout',(req,res)=>{
    flag=0;
    req.body.password="";
    globalusername="";
    res.redirect('/login')
});
app.listen(port);