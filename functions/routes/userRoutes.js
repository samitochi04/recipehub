const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get user profile
router.get('/profile/:username', userController.getUserProfile);

// Update user profile (protected)
router.put('/profile', auth, upload.single('profile_image'), userController.updateProfile);

// Get user's recipes (protected)
router.get('/recipes', auth, userController.getUserRecipes);

// Get user's favorite recipes (protected)
router.get('/favorites', auth, userController.getFavoriteRecipes);

module.exports = router;
