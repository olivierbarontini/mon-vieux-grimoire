require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const path = require("path");

// Routes
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");

// DNS public pour éviter les erreurs SRV
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Connexion MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée !", err));

// Middleware JSON
app.use(express.json());

// CORS (obligatoire pour le frontend)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  next();
});

// Dossier images pour afficher les couvertures
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes API
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);

// Route test
app.get("/", (req, res) => {
  res.send("Backend opérationnel !");
});

module.exports = app;
