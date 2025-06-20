const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const express = require('express');
const cors = require('cors');

// Import database connection
const db = require('./config/db');

// Set global options for all functions
setGlobalOptions({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 60
});

const app = express();

// Middleware
app.use(cors({ 
  origin: true, // Allow all origins when using hosting proxy
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://recipehub-a7da3.web.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Health check endpoint - MUST respond quickly
app.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://recipehub-a7da3.web.app');
  res.status(200).json({ 
    status: 'OK', 
    message: 'RecipeHub API is running on Firebase Functions',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Basic test route
app.get('/test', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://recipehub-a7da3.web.app');
  res.status(200).json({ 
    message: 'Firebase Functions is working!',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Mock recipes endpoint for testing
app.get('/recipes', (req, res) => {
  // Explicit CORS headers
  res.header('Access-Control-Allow-Origin', 'https://recipehub-a7da3.web.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    recipes: [
      {
        id: 1,
        title: 'Test Recipe 1',
        description: 'A simple test recipe',
        username: 'testuser',
        average_rating: 4.5,
        rating_count: 10,
        comment_count: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Test Recipe 2', 
        description: 'Another test recipe',
        username: 'testuser2',
        average_rating: 4.0,
        rating_count: 8,
        comment_count: 3,
        created_at: new Date().toISOString()
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecipes: 2,
      hasMore: false
    }
  });
});

// Mock auth endpoints for testing
app.post('/auth/register', (req, res) => {
  // Explicit CORS headers
  res.header('Access-Control-Allow-Origin', 'https://recipehub-a7da3.web.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(201).json({
    message: 'User registered successfully',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: req.body.username || 'testuser',
      email: req.body.email || 'test@example.com',
      first_name: req.body.first_name || 'Test',
      last_name: req.body.last_name || 'User'
    }
  });
});

app.post('/auth/login', (req, res) => {
  // Explicit CORS headers
  res.header('Access-Control-Allow-Origin', 'https://recipehub-a7da3.web.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'testuser',
      email: req.body.email || 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    }
  });
});

// Simple endpoint to check and setup database
app.get('/setup', async (req, res) => {
  try {
    // Check if tables exist and create basic structure if needed
    const tablesCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'recipes', 'categories')
    `);
    
    if (tablesCheck.rows.length === 0) {
      // Tables don't exist, this might be the issue
      return res.status(500).json({
        error: 'Database tables not found',
        message: 'Please run the database schema setup',
        tables_found: tablesCheck.rows
      });
    }

    res.json({
      message: 'Database setup check complete',
      tables_found: tablesCheck.rows.map(row => row.table_name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Setup check error:', error);
    res.status(500).json({
      error: 'Database setup check failed',
      details: error.message
    });
  }
});

// Import routes only after basic setup
try {
  const authRoutes = require('./routes/authRoutes');
  const recipeRoutes = require('./routes/recipeRoutes');
  const userRoutes = require('./routes/userRoutes');

  // Routes - note: /api prefix will be added by Firebase hosting rewrite
  app.use('/auth', authRoutes);
  app.use('/recipes', recipeRoutes);
  app.use('/users', userRoutes);
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  
  // Fallback route for errors
  app.use('*', (req, res) => {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Routes could not be loaded'
    });
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Application error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error'
  });
});

// Export the Express app as a Firebase Function
exports.api = onRequest({
  memory: '1GiB',
  timeoutSeconds: 60,
  maxInstances: 10,
  invoker: 'public' // Make function publicly accessible
}, app);

