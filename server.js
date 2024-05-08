const fs = require("fs");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
process.stdin.setEncoding("utf8");
const args = process.argv.slice(2);

const portNumber = args[0];
app.set("view engine", "ejs");
app.set("views", "./templates");
app.use(bodyParser.json());
app.use(express.json());

const http = require('https');

const options = {
	method: 'GET',
	hostname: 'sky-scrapper.p.rapidapi.com',
	port: null,
	path: '/api/v1/flights/getFlightDetails?itineraryId=%3CREQUIRED%3E&legs=%5B%7B%22destination%22%3A%22LOND%22%2C%22origin%22%3A%22LAXA%22%2C%22date%22%3A%222024-04-11%22%7D%5D&adults=1&currency=USD',
	headers: {
		'X-RapidAPI-Key': '0c583d7cb2msh81fa754ebbe153cp1b797djsn47c8d069c3a7',
		'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
	}
};

// Log the request options
console.log("Request options:", options);

const req = http.request(options, function (res) {
	// Log the response status and headers
	console.log(`STATUS: ${res.statusCode}`);
	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	const chunks = [];

	res.on('data', function (chunk) {
		// Log each chunk of data as it is received
		console.log("Chunk received:", chunk);
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		// Log the complete response body
		console.log(`BODY: ${body.toString()}`);
	});
});

req.on('error', (e) => {
	// Log any errors that occur during the request
	console.error(`Problem with request: ${e.message}`);
});

req.end();

// Example endpoint to ensure your server is running
app.get("/", (req, res) => {
  res.render("home");
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
