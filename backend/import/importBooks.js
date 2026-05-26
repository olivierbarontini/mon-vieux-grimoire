require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Book = require("../models/Book");

// Connexion MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion MongoDB OK"))
  .catch((err) => console.error(err));

// Lecture du fichier data.json
const dataPath = path.join(__dirname, "data.json");
const raw = fs.readFileSync(dataPath, "utf-8");
const books = JSON.parse(raw);

// Image placeholder obligatoire
const placeholder = "http://localhost:4000/images/placeholder.webp";

async function importBooks() {
  try {
    await Book.deleteMany(); // Nettoyage (optionnel)

    const formatted = books.map((b) => ({
      userId: "000000000000000000000000", // utilisateur fictif
      title: b.title,
      author: b.author,
      year: b.year || 2020,
      genre: b.genre || "Inconnu",
      ratings: [
        {
          userId: "000000000000000000000000",
          grade: b.rating || 3,
        },
      ],
      averageRating: b.rating || 3,
      imageUrl: placeholder,
    }));

    await Book.insertMany(formatted);

    console.log("Import terminé !");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importBooks();
