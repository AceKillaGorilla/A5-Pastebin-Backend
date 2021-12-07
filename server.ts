import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", async (req, res) => {
  try {
  const result = await client.query(
    'select * from pasties'
  )
  res.json(result.rows);
  }
  catch(error){
    console.error(error)
  }
});

app.get("/latest", async (req, res) =>{
  try {
    const result = await client.query(
      'select * from pasties order by created_timestamp desc limit 10'
    )
    res.json(result.rows);
    }
    catch(error){
      console.error(error)
    }
});

app.get("/:id", async (req, res) => {
  try {
    const id = req.params.id
    const result = await client.query(
      'select * from pasties where id = $1', [id]
    )
    res.json(result.rows);
    }
    catch(error){
      console.error(error)
    }
});

app.post("/", async (req, res) => {
  try {
    const {title, contents} = req.body
    const id = req.params.id
    const result = await client.query(
      'insert into pasties (title, contents) values ($1, $2)', [title, contents]
    )
    res.json(result.rows);
    }
    catch(error){
      console.error(error)
    }
});

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
