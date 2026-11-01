const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.MONGODB_CLOUD_NAME,
  api_key: process.env.MONGODB_API_KEY,
  api_secret: process.env.MONGODB_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome on server" });
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all(/.*/, (req, res) => {
  return res.status(404).json({ message: "Not Found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
