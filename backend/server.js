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
        return res.render('index.ejs',{access_token:process.env.MAPBOXGL_ACCESSTOKEN});
    }
    res.redirect('/login');
});

app.get('/news',(req,res)=>{
    if(flag==1){
        return res.render('news.ejs',{mapbox_access_token:process.env.MAPBOXGL_ACCESSTOKEN,newsapi_access_token:process.env.NEWSAPI_ACCESSTOKEN});
    }
    res.redirect('/login');
});

app.get('/weather_updates',(req,res)=>{
    if(flag==1){
        return res.render('weather_updates.ejs',{mapbox_access_token:process.env.MAPBOXGL_ACCESSTOKEN});
    }
    res.redirect('/login');
});

app.post('/weather_updates',(req,res)=>{
    var loc=req.body.location;
    var date_travel=req.body.date;
    var file_res;
    async function y(){
        //feather.replace();

        // Obtaining the day of the week
        const d = new Date();
        var day_digit = d.getDay();
        var days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var day=days[day_digit];

        //Obtaining the date
        var date=d.getDate();

        // Obtaining the month 
        const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
        var month_digit = d.getMonth();
        var month=months[month_digit];

        // Obtaining the year 
        var year=d.getFullYear();

        //Setting the date
        var full_date=date+" "+month+" "+year;
		var date1=new Date(date_travel); // Travel date
		//console.log(date1);
		var date2_date=date;
		if(date2_date<10){
			date2_date="0"+date2_date;
		}
		var date2_month=month_digit+1;
		if(date2_month<10){
			date2_month="0"+date2_month;
		}
		var date2_year=year;
		var date2=date2_year+"-"+date2_month+"-"+date2_date;
		//console.log(date2);
		date2=new Date(date2); //Today's date
		//console.log(date2);

		var Difference_In_Time = date1.getTime() - date2.getTime();
		var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

		if(Difference_In_Days<0){
			Difference_In_Days=0;
		}
		console.log(Difference_In_Days);

            var jsonresponse;
            var req1=`https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_ACCESSTOKEN}&q=${loc}&days=5&aqi=no`;
            fetch(req1).then(async function call(response) {
                jsonresponse= await response.json();
            }).then(async function xy(){
                var current_temp=jsonresponse.current.temp_c+"°C";
                var current_condition=jsonresponse.current.condition.text;
				//Mapping weather codes to weather icons
				var sun=[1000];
				var cloud_lightning=[1087,1273,1276];
				var cloud_rain=[1063,1180,1183,1186,1189,1192,1195,1198,1201,1240,1243,1246];
				var cloud_drizzle=[1150,1153,1168,1171,1072];
				var cloud_snow=[1066,1069,1114,1117,1204,1207,1210,1213,1216,1219,1222,1225,1237,1249,1252,1255,1258,1261,1264,1279,1282];
				var cloud=[1003,1006,1009,1030,1135,1147];

				// Function for getting weather icon
				function check(code){
					if(sun.includes(code)){
						return "sun";
					}
					else
					if(cloud_lightning.includes(code)){
						return "cloud-lightning";
					}
					else
					if(cloud_rain.includes(code)){
						return "cloud-rain";
					}
					else
					if(cloud_drizzle.includes(code)){
						return "cloud-drizzle";
					}
					else
					if(cloud_snow.includes(code)){
						return "cloud-snow";
					}
					else
					if(cloud.includes(code)){
						return "cloud";
					}
					else{
						return "sun";
					}
				}

                // Current weather icon
				var code1=jsonresponse.current.condition.code;
				var icon_curr=check(code1);
				console.log(icon_curr);
                icon_curr="cid:"+icon_curr;

                //Setting the feels like temperature
				var feels_like=Math.trunc(jsonresponse.current.feelslike_c)+"°C";
				//Setting the visibility
				var visibility=jsonresponse.current.vis_km+" km";
				//Setting the precipitation
				var precipitation=jsonresponse.current.precip_mm+" mm";
				//Setting the humidity
				var humidity=jsonresponse.current.humidity+" %";
				//Setting the wind
				var wind=jsonresponse.current.wind_kph+" km/h";
                
                //Setting the day names for the upcoming 4 days
				var days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
				if(day_digit+1==days.length){
					day_digit=-1;
				}
				var day2=days[++day_digit];

				if(day_digit+1==days.length){
					day_digit=-1;
				}
				var day3=days[++day_digit];

				if(day_digit+1==days.length){
					day_digit=-1;
				}
				var day4=days[++day_digit];

				if(day_digit+1==days.length){
					day_digit=-1;
				}
				var day5=days[++day_digit];
                
                //Mapping weather codes to weather icons
				var sun=[800];
				var cloud_lightning=[200,201,202,230,231,232,233];
				var cloud_rain=[500,501,502,511,520,521,522,900];
				var cloud_drizzle=[300,301,302];
				var cloud_snow=[600,601,602,610,611,612,621,622,623];
				var cloud=[700,711,721,731,741,751,801,802,803,804];

				var place=loc.substring(0, loc.indexOf(' '));
				if(place==''){
					place=loc;
				}
				

				// Making API call for upcoming days weather details
				var req2 = `https://api.weatherbit.io/v2.0/forecast/daily?city=${place}&key=${process.env.WEATHERBIT_ACCESSTOKEN}&days=5`;
				var jsonresponse2;
                fetch(req2).then(async function call(response) {
					jsonresponse2= await response.json();
					}).then(async function y(){
						//Setting the upcoming days average temperature
						var temp2=Math.trunc(jsonresponse2.data[1].temp)+"°C";
						var temp3=Math.trunc(jsonresponse2.data[2].temp)+"°C";
						var temp4=Math.trunc(jsonresponse2.data[3].temp)+"°C";
						var temp5=Math.trunc(jsonresponse2.data[4].temp)+"°C";

						console.log(jsonresponse2);

						//Setting the weather icons for the upcoming days
						var code2=jsonresponse2.data[1].weather.code;
						var icon_curr2=check(code2);
						var code3=jsonresponse2.data[2].weather.code;
						var icon_curr3=check(code3);
						var code4=jsonresponse2.data[3].weather.code;
						var icon_curr4=check(code4);
						var code5=jsonresponse2.data[4].weather.code;
						var icon_curr5=check(code5);
                        icon_curr2="cid:"+icon_curr2;
                        icon_curr3="cid:"+icon_curr3;
                        icon_curr4="cid:"+icon_curr4;
                        icon_curr5="cid:"+icon_curr5;


        var message="You have successfully subscribed for weather updates!";
        res.render("weather_updates.ejs",{mapbox_access_token:process.env.MAPBOXGL_ACCESSTOKEN,message:message});
        file_res=await ejs.renderFile(path.join(__dirname,"..","views","weather_result.ejs"), {location:req.body.location,email:req.body.email,date:req.body.date,day:day,full_date:full_date,loc:loc,diff_in_days:Difference_In_Days,icon_curr:icon_curr,curr_temp:current_temp,curr_condition:current_condition,feels_like:feels_like,visibility:visibility,precipitation:precipitation,humidity:humidity,wind:wind,day2:day2,day3:day3,day4:day4,day5:day5,temp2:temp2,temp3:temp3,temp4:temp4,temp5:temp5,icon_curr2:icon_curr2,icon_curr3:icon_curr3,icon_curr4:icon_curr4,icon_curr5:icon_curr5});
        console.log("Hello1");
        console.log(file_res);



        console.log("Hello2");
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false, 
            auth: {
                user: process.env.NODEMAILER_USERNAME, 
                pass: process.env.NODEMAILER_PASSWORD
            }
        });
        transporter.use('compile', inLineCss());
    const data=file_res;
    var path_attach1=path.join(__dirname,"..","public","loc_icon.png");
    var path_attach2=path.join(__dirname,"..","public","sun.png");
    var path_attach3=path.join(__dirname,"..","public","cloud-lightning.png");
    var path_attach4=path.join(__dirname,"..","public","cloud-rain.png");
    var path_attach5=path.join(__dirname,"..","public","cloud-drizzle.png");
    var path_attach6=path.join(__dirname,"..","public","cloud-snow.png");
    var path_attach7=path.join(__dirname,"..","public","cloud.png");
    var subject="Daily Weather Update ("+full_date+")";
    var mainOptions = {
        from: process.env.NODEMAILER_FROM,
        to: process.env.NODEMAILER_TO,
        subject: subject,
        attachments: [{
            filename: 'loc_icon.png',
            path: path_attach1,
            cid: 'loc_icon'
        },
        {
            filename: 'sun.png',
            path: path_attach2,
            cid: 'sun' 
        },
        {
            filename: 'cloud-lightning.png',
            path: path_attach3,
            cid: 'cloud-lightning' 
        },
        {
            filename: 'cloud-rain.png',
            path: path_attach4,
            cid: 'cloud-rain' 
        },
        {
            filename: 'cloud-drizzle.png',
            path: path_attach5,
            cid: 'cloud-drizzle' 
        },
        {
            filename: 'cloud-snow.png',
            path: path_attach6,
            cid: 'cloud-snow' 
        },
        {
            filename: 'cloud.png',
            path: path_attach7,
            cid: 'cloud' 
        },
        ],
        html: data
    };
    console.log("html data ======================>", mainOptions.html);
    transporter.sendMail(mainOptions, (err, info) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Message sent: ' + info.response);
    }
    });
    });
    });
    }

    //    async function x(){
           
    // }
    async function z(){
       await y();
      // await x();
    }
    z();
    
});

////////////////////////////////////// FOR TESTING PURPOSES....TO BE DELETED LATER.../////////////////
app.get('/weather_result',(req,res)=>{
    if(flag==1){
        return res.render('weather_result.ejs');
    }
    res.redirect('/login');
});
////////////////////////////////////// FOR TESTING PURPOSES....TO BE DELETED LATER.../////////////////

app.get('/my_journal',(req,res)=>{
    if(flag==1){
        return res.render('my_journal.ejs');
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