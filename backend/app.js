require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");

// Use public DNS servers to avoid local DNS resolver refusing SRV queries
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

const mongoUrl = process.env.MONGODB_URI;

mongoose.set("strictQuery", true);
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée !", err));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend opérationnel !");
});

module.exports = app;
