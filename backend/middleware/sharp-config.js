const sharp = require("sharp");
const fs = require("fs");

module.exports = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalPath = req.file.path;
  const newFilename = req.file.filename.replace(/\.[^.]+$/, "") + ".webp";
  const newPath = `images/${newFilename}`;

  sharp(originalPath)
    .resize(500)
    .webp({ quality: 80 })
    .toFile(newPath)
    .then(() => {
      fs.unlink(originalPath, () => {});
      req.file.filename = newFilename;
      next();
    })
    .catch((error) => res.status(500).json({ error }));
};
