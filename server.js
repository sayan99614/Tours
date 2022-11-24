process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
const dotenv = require("dotenv");
const app = require("./src/app");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

const port = process.env.SERVER_PORT || 3000;

const DB = process.env.DATABASE_URL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

const server = app.listen(port, () => {
  console.log(`app is running 👋 :: on-${port}`);
});
