const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

app.use(express.static("public"));
const args = process.argv.slice(2);
const portNumber = args[0];

app.set("view engine", "ejs");
app.set("views", "./templates");
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function fetchAirlineFlights(ident, time) {
  const fetch = (await import("node-fetch")).default;
  const url = `https://flightera-flight-data.p.rapidapi.com/airline/flights?ident=${ident}&time=${encodeURIComponent(
    time
  )}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "flightera-flight-data.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
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
  const fetch = (await import("node-fetch")).default;
  const url = `https://flightera-flight-data.p.rapidapi.com/airline/info?name=${name}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "flightera-flight-data.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
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

app.get("/viewflights", (req, res) => {
  res.render("view");
});

app.get("/airline", (req, res) => {
  res.render("airline");
});

app.get("/book", (req, res) => {
  //TODO add to mongodb
  res.render("book");
});

app.post("/booking", async (req, res) => {
  const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
  let flightsTable = `
  <h1>Your Flight History</h1>`

;
  try {
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        const collection = db.collection(process.env.MONGO_COLLECTION);
        
         let {  passengername, crn, price, email } = req.body;
         let flightClass = "";
         if (price == "E") {
                price = 1000;
                flightClass = "Elite"
         } else if (price == "P") {
                price = 850;
                flightClass = "Premium"
         } else {
                price = 700;
                flightClass = "Working"
         }
        const creditCard = req.body.cc1 + req.body.cc2 + req.body.cc3 + req.body.cc4;

        const result = await collection.insertOne({passengername, crn, price, email, flightClass, creditCard});

        const allFlights = await collection.find({ passengername, creditCard }).toArray();

        flightsTable += ` <table border="1">
        <tr>
            <th>Name</th>
            <th>Flight Name</th>
            <th>Class</th>

        </tr>
        `
        

        allFlights.forEach(allFlights => {
          flightsTable += `
              <tr>
                  <td>${allFlights.passengername}</td>
                  <td>${allFlights.crn}</td>
                  <td>${allFlights.flightClass}</td>

              </tr>
                `;
            });
        flightsTable += '</table>'

      
    

        


        // if (result.insertedId) {
        //     res.status(201).json({ message: "Flight submitted successfully", id: result.insertedId });
        // } else {
        //     res.status(400).send("error submitting");
        // }
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: e.message });
    } finally {
        await client.close();
    }

  const passengername = req.body.passengername;
  const crn = req.body.crn;
  const price = req.body.price;
  const email = req.body.email;
  const creditCard = req.body.cc1 + req.body.cc2 + req.body.cc3 + req.body.cc4;


  

 

  
  res.render("confirmation", { passengername, crn, price, email, flightsTable});
});

app.get("/remove", (req, res) => {
  //TODO remove from mongodb

  res.render("cancel");
});

app.post("/delete", async (req, res) => {
        const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
        try {
            await client.connect();
            const db = client.db(process.env.MONGO_DB_NAME);
            const collection = db.collection(process.env.MONGO_COLLECTION);
            // Use 'passengername' to match the field name in the document
            const { passengername, crn, email, cc1, cc2, cc3, cc4 } = req.body; 

    
            console.log("Attempting to delete with:", { passengername, crn, email });
    
            // Delete the document based on the matching fields
            const creditCard = cc1 + cc2 + cc3 + cc4;

            const result = await collection.deleteOne({ passengername, crn, email, creditCard });
    
            if (result.deletedCount === 1) {
                res.render("confirmcancel", { passengername, crn });
            } else {
                console.log("No document found with:", { passengername, crn, email });
                res.status(404).send({ message: "No matching document found to delete." });
            }
        } catch (e) {
            console.error(e);
            res.status(500).send({ message: e.message });
        } finally {
            await client.close();
        }
    });
   
    

app.listen(portNumber, () => {
  console.log(
    `Web server started and running at http://localhost:${portNumber}`
  );
  startCLI();
});

function startCLI() {
  const prompt = "Stop to shutdown the server: ";
  process.stdout.write(prompt);
  process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
      const command = dataInput.toString().trim();
      if (command === "stop") {
        console.log("Shutting down the server");
        process.exit(0);
      }
      process.stdout.write(prompt);
      process.stdin.resume();
    }
  });
}
