const express = require("express");
var cors = require("cors");
require("dotenv").config();

const { google } = require("googleapis");

// add relevent scopes for the google calander api
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

const calander = google.calendar({
    version: 'v3',
    auth: process.env.CALANDER_API_KEY
})

// OAuth2 init
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/", function (req, res) {
  res.send("Hello World");
});
app.get("/google", function (req, res) {
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",

    // If you only need one scope you can pass it as a string
    scope: SCOPES,
  });
  res.redirect(url);
});

app.get("/google/callback", async (req, res) => {
  console.log(req.query);
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send("it works");
});

app.post("/google/free-busy", async (req, res)=>{
    console.log(req.body);

    // add user input time
    const startTime = new Date(req.body.startTime)
    const endTime = new Date(req.body.endTime)

    // use free/busy method from calander
    // more info here
    // https://developers.google.com/calendar/api/v3/reference/freebusy/query
    await calander.freebusy.query({
        requestBody: {
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            
        }
    }).then(result=>{
        const response = result.data.calendars
        res.json(response);
    }).catch((err)=>{
        console.log(err);
    });
})

app.listen(3000, () => {
  console.log("app listen on port 3000");
});
