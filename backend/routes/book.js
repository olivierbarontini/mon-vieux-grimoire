const express = require("express");
const router = express.Router();

const bookCtrl = require("../controllers/book");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sharpMiddleware = require("../middleware/sharp-config");

// Récupérer tous les livres
router.get("/", bookCtrl.getAllBooks);

// Récupérer les 3 meilleurs livres
router.get("/bestrating", bookCtrl.getBestRatedBooks);

// Récupérer un livre par ID
router.get("/:id", bookCtrl.getOneBook);

// Créer un livre
router.post("/", auth, multer, sharpMiddleware, bookCtrl.createBook);

// Modifier un livre
router.put("/:id", auth, multer, sharpMiddleware, bookCtrl.modifyBook);

// Supprimer un livre
router.delete("/:id", auth, bookCtrl.deleteBook);

// Noter un livre
router.post("/:id/rating", auth, bookCtrl.rateBook);

module.exports = router;
