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

// app.get("/applications", (req, res) => {
//   res.render("applications");
// });

app.get("/", (req, res) => {
  res.render("home");
});

// app.get("/view/:id", async (req, res) => {
//     const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
//     try {
//         await client.connect();
//         const db = client.db(process.env.MONGO_DB_NAME);
//         const collection = db.collection(process.env.MONGO_COLLECTION);
//         const application = await collection.findOne({ _id: new ObjectId(req.params.id) });
//         if (application) {
//             res.render("view", application); 
//         } else {
//             res.status(404).send("Application not found");
//         }
//     } catch (e) {
//         console.error(e);
//         res.status(500).send({ message: e.message });
//     } finally {
//         await client.close();
//     }
// });

// app.get("/review", (req, res) => {
//   res.render("review");
// });

// app.get("/app_not_found", (req, res) => {
//         res.render("app_not_found");
//       });
      

// app.get("/gpa", (req, res) => {
//   res.render("gpa");
// });

// app.get("/remove", (req, res) => {
//   res.render("remove");
// });

// app.get("/processGPA", (req, res) => {
//         let gpaTable = decodeURIComponent(req.query.data);
//         res.render("processGPA", { gpaTable: gpaTable });
// });


// app.get("/processRemove", (req, res) => {
//         let numRemoved = req.query.data;
//         res.render("processRemove", { numRemoved: numRemoved });
// });

// app.post("/remove-all", async (req, res) => {
//         const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
//         try {
//             await client.connect();
//             const db = client.db(process.env.MONGO_DB_NAME);
//             const collection = db.collection(process.env.MONGO_COLLECTION);
//             const result = await collection.deleteMany({});
//             const numRemoved = result.deletedCount;
//             console.log(`${numRemoved} records removed.`); 
//             res.status(200).json({ numRemoved: numRemoved }); 
//         } catch (e) {
//             console.error("Error removing records:", e);
//         } finally {
//             await client.close();
//         }
//     });


// app.post("/submit-application", async (req, res) => {
//         const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
//         try {
//             await client.connect();
//             const db = client.db(process.env.MONGO_DB_NAME);
//             const collection = db.collection(process.env.MONGO_COLLECTION);
//             const { name, email, gpa, background } = req.body;
//             const numericGPA = parseFloat(gpa); 
//             const result = await collection.insertOne({ name, email, gpa: numericGPA, background });
//             if (result.insertedId) {
//                 res.status(201).json({ message: "Application submitted successfully", id: result.insertedId });
//             } else {
//                 res.status(400).send("error submitting");
//             }
//         } catch (e) {
//             console.error(e);
//             res.status(500).send({ message: e.message });
//         } finally {
//             await client.close();
//         }
//     });
    

//     app.post("/get-application", async (req, res) => {
//         const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
//         const { email } = req.body; 
//         try {
//             await client.connect();
//             const db = client.db(process.env.MONGO_DB_NAME);
//             const collection = db.collection(process.env.MONGO_COLLECTION);
//             const application = await collection.findOne({ email: email });
    
//             if (application) {
//                 res.json({ id: application._id }); 
//             }  else {
//                 res.sendStatus(404);
//             }
//         } catch (e) {
//             console.error(e);
//             res.status(500).json({ message: e.message });
//         } finally {
//             await client.close();
//         }
//     });
        

//     app.post("/get-gpa", async (req, res) => {
//         const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
//         let gpaTable = "<p>No matching applications found.</p>"; 
    
//         try {
//             await client.connect();
//             const db = client.db(process.env.MONGO_DB_NAME);
//             const collection = db.collection(process.env.MONGO_COLLECTION);
//             const gpa = parseFloat(req.body.gpa);
//             const applications = await collection.find({ gpa: { $gte: gpa } }).toArray();
//             if (applications.length > 0) {
//                 gpaTable = `<table border='1'><tr><th>Name</th><th>GPA</th></tr>`;
//                 applications.forEach(applicant => {
//                     const gpaNum = parseFloat(applicant.gpa); 
//                     gpaTable += `<tr><td>${applicant.name}</td><td>${gpaNum.toFixed(2)}</td></tr>`; 
//                 });
//                 gpaTable += `</table>`;
//             }
//             res.render("processGPA", { gpaTable: gpaTable });
//         } catch (e) {
//             console.error(e);
//         } finally {
//             await client.close();
//         }
//     });
    
    
    //testing

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
