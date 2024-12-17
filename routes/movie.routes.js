const express = require('express');
const { 
    getMovies, 
    getMovie, 
    createMovieItem, 
    updateMovieItem, 
    deleteMovieItem 
} = require("../controllers/movie.controller.js");
const validateBodyMiddleware = require('../middleware/validateBodyMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoleMiddleware = require('../middleware/authorizeRoleMiddleware');

const router = express.Router();

router.use(authMiddleware);  

router.get("/readall", getMovies);
router.get("/read/:id", getMovie);
router.post("/create", authorizeRoleMiddleware, validateBodyMiddleware, createMovieItem);
router.patch("/update/:id", authorizeRoleMiddleware, validateBodyMiddleware, updateMovieItem);
router.delete("/delete/:id", authorizeRoleMiddleware, deleteMovieItem);

module.exports = router;