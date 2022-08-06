# Tripops
Tripops was developed in order to provide users a one-stop solution for travel-planning. The application consists of: 
* An **interactive choropleth map** to depict countries by their natural-disaster risk scores 
* A component for users to obtain **news articles** by location 
* A platform that enables users to create their own personalized **travel journal** by **storing notes** in the form of text, as well as **images, videos and other file formats** 
* A feature that sets users up to receive **weather forecasts (every 24 hours)** via email for the destination they intend to travel to

## Usage

**Step 1**

Install **MongoDB communtiy server** from the following link: https://www.mongodb.com/try/download/community

**Step 2**

Type the command ```services.msc``` in Command Prompt and hit Enter

**Step 3**

Start the **MongoDB server (MongoDB)** service 

**Step 4**

Clone this repo by using the code below

```
git clone https://github.com/eshaanganesh2/Tripops.git
```

**Step 5**

Navigate to the **backend** folder by using the command ```cd backend``` and run the command ```npm install``` in order to install all the dependencies

**Step 6**

Run the command ```npm run devStart``` in order to start the server at port number 3000

**Step 7**

Open another terminal window and navigate to the **backend** folder. Run the command ```npm run scriptStart``` in order to run the script for sending daily automated weather forecasts to all existing users who have subscribed for the same.

**Step 8**

Type ```localhost:3000/register``` in your browser and hit Enter to visit the registration page

## Note :warning:
All API keys and email authentication keys are stored in a **.env file** (not pushed to GitHub). Hence, all ```process.env``` variables must be replaced with your own personal keys.

## Demo

<h3> <ins> Registration Page </ins> </h3>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/register.PNG" width="512"/>

<h3> <ins> Login Page </ins> </h3>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/login.PNG" width="512"/>

<h3> <ins> Interactive choropleth map </ins> </h3>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/choropleth.gif" width="512"/>

<h3> <ins> Obtaining news articles </ins> </h3>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/news.gif" width="512"/>

<h3> <ins> Travel journal (Notes) </ins> </h3>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/journal_notes.gif" width="512"/>

<h3> <ins> Travel journal (Images, Videos and other documents) </ins> </h3>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/journal_misc.gif" width="512"/>

<h3> <ins> Automated daily weather forecasts </ins> </h3>
<ul type="bullet"> 
<li> <h4> <ins> Form </ins> </h4> </li>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/weather_form.PNG" width="512"/>

<li> <h4> <ins> Weather forecast (as received in email) </ins> </h4> </li>
<img src="https://github.com/eshaanganesh2/Tripops/blob/main/demo/weather_forecast.PNG" width="512"/>
</ul>




