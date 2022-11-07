const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const Tour = require("./models/tourModel");
const fs = require("fs");

const DB = process.env.DATABASE_URL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

const tour_data = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/dev-data.json`)
);

const saveTours = async () => {
  try {
    await Tour.create(tour_data);
    console.log("successfly saved all data");
  } catch (error) {
    console.log(error);
  }
};

const deleteTours = async () => {
  try {
    await Tour.deleteMany();
    console.log("successfly deleted all data");
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "--import") {
  saveTours();
} else if (process.argv[2] === "--delete") {
  deleteTours();
}
