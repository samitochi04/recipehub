const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all recipes with filters
router.get('/', recipeController.getAllRecipes);

// Get single recipe by ID
router.get('/:id', recipeController.getRecipeById);

// Create a new recipe (protected, with image upload)
router.post('/', auth, upload.single('image'), recipeController.createRecipe);

// Update a recipe (protected)
router.put('/:id', auth, upload.single('image'), recipeController.updateRecipe);

// Delete a recipe (protected)
router.delete('/:id', auth, recipeController.deleteRecipe);

// Add comment to a recipe (protected)
router.post('/:id/comments', auth, recipeController.addComment);

// Rate a recipe (protected)
router.post('/:id/ratings', auth, recipeController.rateRecipe);

// Get recipe comments
router.get('/:id/comments', recipeController.getRecipeComments);

// Toggle favorite recipe status (protected)
router.post('/:id/favorite', auth, recipeController.toggleFavorite);

module.exports = router;
