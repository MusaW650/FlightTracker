const express = require("express");
const app = express();
const bodyParser = require('body-parser');
require("dotenv").config();
const path = require('path');

app.use(express.static('public'));
const args = process.argv.slice(2);
const portNumber = args[0];

app.set("view engine", "ejs");
app.set("views", "./templates");
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


async function fetchAirlineFlights(ident, time) {
  const fetch = (await import('node-fetch')).default;
  const url = `https://flightera-flight-data.p.rapidapi.com/airline/flights?ident=${ident}&time=${encodeURIComponent(time)}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'flightera-flight-data.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

app.get("/api/airline-flights", async (req, res) => {
  const { ident, time } = req.query;

  if (!ident || !time) {
    res.status(400).send("Missing required parameters: ident and time");
    return;
  }

  try {
    const data = await fetchAirlineFlights(ident, time);
    res.json(data);
  } catch (error) {
    res.status(500).send(`Error fetching data: ${error.message}`);
  }
});

async function fetchAirlineInfo(name) {
        const fetch = (await import('node-fetch')).default;
        const url = `https://flightera-flight-data.p.rapidapi.com/airline/info?name=${name}`;
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'c1fc13ac94msh47eede7e9019808p11da91jsn04a20fac8224',
            'X-RapidAPI-Host': 'flightera-flight-data.p.rapidapi.com'
          }
        };
      
        try {
          const response = await fetch(url, options);
          const result = await response.json();
          return result;
        } catch (error) {
          console.error('Error fetching data:', error);
          throw error;
        }
      }
      
      app.get("/api/airline-info", async (req, res) => {
        const { name } = req.query;
      
        if (!name) {
          res.status(400).send("Missing required parameter: name");
          return;
        }
      
        try {
          const data = await fetchAirlineInfo(name);
          res.json(data);
        } catch (error) {
          res.status(500).send(`Error fetching data: ${error.message}`);
        }
      });

app.get("/", (req, res) => {
  res.render("home");
});

app.get('/viewflights', (req, res) => {
  res.render("view");
});

app.get('/airline', (req, res) => {
        res.render("airline");
});

app.get('/book', (req, res) => { //TODO add to mongodb
  res.render("book");
});

app.post('/booking', (req, res) => {
  const passengername = req.body.passengername; 
  const crn = req.body.crn 
  const info = req.body.info 

  res.render("confirmation", { passengername, crn, info })
});

app.get('/remove', (req, res) => { //TODO remove from mongodb
  
  res.render("cancel");
});

app.post('/delete', (req, res) => {
  const passenger = req.body.passenger
  const flightname = req.body.flightname
  res.render("confirmcancel", {passenger, flightname});
});

app.listen(portNumber, () => {
  console.log(`Web server started and running at http://localhost:${portNumber}`);
  startCLI();
});

function startCLI() {
  const prompt = "Stop to shutdown the server: ";
  process.stdout.write(prompt);
  process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
      const command = dataInput.trim();
      if (command === "stop") {
        console.log("Shutting down the server");
        process.exit(0);
      }
      process.stdout.write(prompt);
      process.stdin.resume();
    }
  });
}
