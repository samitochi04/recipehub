const db = require('../config/db');

// Get all recipes with filters
exports.getAllRecipes = async (req, res) => {
  try {
    const { search, category, difficulty, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT r.*, u.username, u.profile_image AS author_image,
      COALESCE(AVG(rt.rating), 0) AS average_rating,
      COUNT(DISTINCT rt.id) AS rating_count,
      COUNT(DISTINCT c.id) AS comment_count
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      LEFT JOIN comments c ON r.id = c.recipe_id
    `;
    
    const queryParams = [];
    let whereClause = [];
    
    if (search) {
      queryParams.push(`%${search}%`);
      whereClause.push(`(r.title ILIKE $${queryParams.length} OR r.description ILIKE $${queryParams.length})`);
    }
    
    if (category) {
      queryParams.push(category);
      whereClause.push(`r.id IN (
        SELECT recipe_id FROM recipe_categories rc
        JOIN categories cat ON rc.category_id = cat.id
        WHERE cat.name = $${queryParams.length}
      )`);
    }
    
    if (difficulty) {
      queryParams.push(difficulty);
      whereClause.push(`r.difficulty = $${queryParams.length}`);
    }
    
    if (whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }
    
    query += ' GROUP BY r.id, u.username, u.profile_image';
    query += ' ORDER BY r.created_at DESC';
    
    // Add pagination
    queryParams.push(limit);
    queryParams.push(offset);
    query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
    
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT r.id) 
      FROM recipes r
      ${whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : ''}
    `;
    
    const countResult = await db.query(countQuery, queryParams.slice(0, -2));
    const totalRecipes = parseInt(countResult.rows[0].count);
    
    res.json({
      recipes: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecipes / limit),
        totalRecipes,
        hasMore: offset + limit < totalRecipes
      }
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get recipe details
    const recipeQuery = `
      SELECT r.*, u.username, u.profile_image AS author_image,
      COALESCE(AVG(rt.rating), 0) AS average_rating,
      COUNT(DISTINCT rt.id) AS rating_count
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      WHERE r.id = $1
      GROUP BY r.id, u.username, u.profile_image
    `;
    
    const recipeResult = await db.query(recipeQuery, [id]);
    
    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const recipe = recipeResult.rows[0];
    
    // Get ingredients
    const ingredientsResult = await db.query(
      'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id',
      [id]
    );
    
    // Get instructions
    const instructionsResult = await db.query(
      'SELECT * FROM instructions WHERE recipe_id = $1 ORDER BY step_number',
      [id]
    );
    
    // Get categories
    const categoriesResult = await db.query(
      `SELECT c.id, c.name
       FROM categories c
       JOIN recipe_categories rc ON c.id = rc.category_id
       WHERE rc.recipe_id = $1`,
      [id]
    );
    
    // Format and return recipe
    res.json({
      ...recipe,
      ingredients: ingredientsResult.rows,
      instructions: instructionsResult.rows,
      categories: categoriesResult.rows
    });
  } catch (error) {
    console.error('Get recipe by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const {
      title, description, prep_time_minutes, cook_time_minutes,
      servings, difficulty, ingredients, instructions, categories
    } = req.body;
    
    // Parse string fields that come as JSON strings from the form
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    
    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert recipe
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      
      const recipeResult = await client.query(
        `INSERT INTO recipes (
          title, description, image_url, prep_time_minutes, cook_time_minutes,
          servings, difficulty, user_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING *`,
        [title, description, imageUrl, prep_time_minutes, cook_time_minutes, 
         servings, difficulty, req.user.id]
      );
      
      const recipeId = recipeResult.rows[0].id;
      
      // Insert ingredients
      for (const ingredient of parsedIngredients) {
        await client.query(
          `INSERT INTO ingredients (
            recipe_id, name, quantity, unit, notes
          ) VALUES ($1, $2, $3, $4, $5)`,
          [recipeId, ingredient.name, ingredient.quantity, ingredient.unit, ingredient.notes]
        );
      }
      
      // Insert instructions
      for (const instruction of parsedInstructions) {
        await client.query(
          `INSERT INTO instructions (
            recipe_id, step_number, description
          ) VALUES ($1, $2, $3)`,
          [recipeId, instruction.step_number, instruction.description]
        );
      }
      
      // Insert categories
      for (const categoryId of parsedCategories) {
        await client.query(
          `INSERT INTO recipe_categories (
            recipe_id, category_id
          ) VALUES ($1, $2)`,
          [recipeId, categoryId]
        );
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        message: 'Recipe created successfully',
        recipe: recipeResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a recipe
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, prep_time_minutes, cook_time_minutes,
      servings, difficulty, ingredients, instructions, categories
    } = req.body;
    
    // Parse string fields that come as JSON strings from the form
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
    
    // Check ownership
    const recipeCheck = await db.query(
      'SELECT user_id FROM recipes WHERE id = $1',
      [id]
    );
    
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    if (recipeCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }
    
    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update recipe
      let imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      
      // If no new image is uploaded, keep the existing one
      if (!imageUrl) {
        const currentImage = await client.query(
          'SELECT image_url FROM recipes WHERE id = $1',
          [id]
        );
        imageUrl = currentImage.rows[0].image_url;
      }
      
      await client.query(
        `UPDATE recipes SET
          title = $1, description = $2, image_url = $3, 
          prep_time_minutes = $4, cook_time_minutes = $5,
          servings = $6, difficulty = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [title, description, imageUrl, prep_time_minutes, 
         cook_time_minutes, servings, difficulty, id]
      );
      
      // Delete existing ingredients and insert new ones
      await client.query('DELETE FROM ingredients WHERE recipe_id = $1', [id]);
      for (const ingredient of parsedIngredients) {
        await client.query(
          `INSERT INTO ingredients (
            recipe_id, name, quantity, unit, notes
          ) VALUES ($1, $2, $3, $4, $5)`,
          [id, ingredient.name, ingredient.quantity, ingredient.unit, ingredient.notes]
        );
      }
      
      // Delete existing instructions and insert new ones
      await client.query('DELETE FROM instructions WHERE recipe_id = $1', [id]);
      for (const instruction of parsedInstructions) {
        await client.query(
          `INSERT INTO instructions (
            recipe_id, step_number, description
          ) VALUES ($1, $2, $3)`,
          [id, instruction.step_number, instruction.description]
        );
      }
      
      // Update categories
      await client.query('DELETE FROM recipe_categories WHERE recipe_id = $1', [id]);
      for (const categoryId of parsedCategories) {
        await client.query(
          `INSERT INTO recipe_categories (
            recipe_id, category_id
          ) VALUES ($1, $2)`,
          [id, categoryId]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const recipeCheck = await db.query(
      'SELECT user_id FROM recipes WHERE id = $1',
      [id]
    );
    
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    if (recipeCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }
    
    // Delete recipe (cascading will take care of ingredients, instructions, etc.)
    await db.query('DELETE FROM recipes WHERE id = $1', [id]);
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to a recipe
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Check if recipe exists
    const recipeCheck = await db.query(
      'SELECT id FROM recipes WHERE id = $1',
      [id]
    );
    
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Add comment
    const result = await db.query(
      `INSERT INTO comments (recipe_id, user_id, content, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING id, content, created_at`,
      [id, req.user.id, content]
    );
    
    // Get user info
    const userResult = await db.query(
      'SELECT username, profile_image FROM users WHERE id = $1',
      [req.user.id]
    );
    
    res.status(201).json({
      ...result.rows[0],
      username: userResult.rows[0].username,
      profile_image: userResult.rows[0].profile_image
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate a recipe
exports.rateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if recipe exists
    const recipeCheck = await db.query(
      'SELECT id FROM recipes WHERE id = $1',
      [id]
    );
    
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user has already rated this recipe
    const existingRating = await db.query(
      'SELECT id FROM ratings WHERE recipe_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (existingRating.rows.length > 0) {
      // Update existing rating
      await db.query(
        'UPDATE ratings SET rating = $1 WHERE id = $2',
        [rating, existingRating.rows[0].id]
      );
    } else {
      // Create new rating
      await db.query(
        'INSERT INTO ratings (recipe_id, user_id, rating) VALUES ($1, $2, $3)',
        [id, req.user.id, rating]
      );
    }
    
    // Get updated average rating
    const avgResult = await db.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as rating_count FROM ratings WHERE recipe_id = $1',
      [id]
    );
    
    res.json({
      average_rating: avgResult.rows[0].average_rating,
      rating_count: avgResult.rows[0].rating_count
    });
  } catch (error) {
    console.error('Rate recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recipe comments
exports.getRecipeComments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT c.id, c.content, c.created_at, c.user_id, 
       u.username, u.profile_image
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get recipe comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle favorite recipe status
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if recipe exists
    const recipeCheck = await db.query(
      'SELECT id FROM recipes WHERE id = $1',
      [id]
    );
    
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if already favorited
    const favCheck = await db.query(
      'SELECT * FROM favorites WHERE recipe_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    let isFavorited;
    
    if (favCheck.rows.length > 0) {
      // Remove from favorites
      await db.query(
        'DELETE FROM favorites WHERE recipe_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      isFavorited = false;
    } else {
      // Add to favorites
      await db.query(
        'INSERT INTO favorites (recipe_id, user_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        [id, req.user.id]
      );
      isFavorited = true;
    }
    
    res.json({
      isFavorited,
      message: isFavorited ? 'Recipe added to favorites' : 'Recipe removed from favorites'
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
