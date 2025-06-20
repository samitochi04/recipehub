const db = require('../config/db');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const result = await db.query(
      `SELECT id, username, first_name, last_name, profile_image, bio, created_at
       FROM users
       WHERE username = $1`,
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's recipes count
    const recipeCountResult = await db.query(
      'SELECT COUNT(*) FROM recipes WHERE user_id = $1',
      [result.rows[0].id]
    );
    
    // Get user's ratings averages
    const ratingsResult = await db.query(
      `SELECT AVG(r.rating) as average_rating
       FROM ratings r
       JOIN recipes rec ON r.recipe_id = rec.id
       WHERE rec.user_id = $1`,
      [result.rows[0].id]
    );
    
    res.json({
      ...result.rows[0],
      recipe_count: parseInt(recipeCountResult.rows[0].count),
      average_rating: ratingsResult.rows[0].average_rating || 0
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, bio } = req.body;
    
    let profileImage = undefined;
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }
    
    // Build dynamic query based on provided fields
    let query = 'UPDATE users SET ';
    const queryParams = [];
    const updates = [];
    
    if (first_name !== undefined) {
      queryParams.push(first_name);
      updates.push(`first_name = $${queryParams.length}`);
    }
    
    if (last_name !== undefined) {
      queryParams.push(last_name);
      updates.push(`last_name = $${queryParams.length}`);
    }
    
    if (bio !== undefined) {
      queryParams.push(bio);
      updates.push(`bio = $${queryParams.length}`);
    }
    
    if (profileImage !== undefined) {
      queryParams.push(profileImage);
      updates.push(`profile_image = $${queryParams.length}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    query += updates.join(', ');
    queryParams.push(req.user.id);
    query += ` WHERE id = $${queryParams.length} RETURNING id, username, first_name, last_name, profile_image, bio`;
    
    const result = await db.query(query, queryParams);
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's recipes
exports.getUserRecipes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
       COALESCE(AVG(rt.rating), 0) AS average_rating,
       COUNT(DISTINCT rt.id) AS rating_count,
       COUNT(DISTINCT c.id) AS comment_count
       FROM recipes r
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       LEFT JOIN comments c ON r.id = c.recipe_id
       WHERE r.user_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's favorite recipes
exports.getFavoriteRecipes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.username, u.profile_image AS author_image,
       COALESCE(AVG(rt.rating), 0) AS average_rating,
       COUNT(DISTINCT rt.id) AS rating_count,
       COUNT(DISTINCT c.id) AS comment_count,
       f.created_at AS favorited_at
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       LEFT JOIN comments c ON r.id = c.recipe_id
       WHERE f.user_id = $1
       GROUP BY r.id, u.username, u.profile_image, f.created_at
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get favorite recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
