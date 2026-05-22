const fs = require("fs");
const Book = require("../models/Book");

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Récupérer un livre par ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Récupérer les 3 livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Créer un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    averageRating:
      bookObject.ratings && bookObject.ratings.length > 0
        ? bookObject.ratings[0].grade
        : 0,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Requête non autorisée" });
      }

      const oldImage = book.imageUrl;

      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id },
      )
        .then(() => {
          if (req.file && oldImage) {
            const filename = oldImage.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {});
          }
          res.status(200).json({ message: "Livre modifié !" });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Requête non autorisée" });
      }

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(404).json({ error }));
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  const userId = req.auth.userId;
  const grade = req.body.rating;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const existingRating = book.ratings.find((r) => r.userId === userId);
      if (existingRating) {
        return res
          .status(400)
          .json({ message: "Livre déjà noté par cet utilisateur" });
      }

      book.ratings.push({ userId, grade });

      const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = total / book.ratings.length;

      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
};
