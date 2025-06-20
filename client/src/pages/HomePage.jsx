import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import RecipeCard from '../components/recipes/RecipeCard';

function HomePage() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get highest rated recipes for featured section
        const featuredResponse = await recipeService.getRecipes({
          limit: 3,
          sortBy: 'average_rating',
          order: 'desc'
        });
        
        // Get newest recipes for recent section
        const recentResponse = await recipeService.getRecipes({
          limit: 6,
          sortBy: 'created_at',
          order: 'desc'
        });
        
        setFeaturedRecipes(featuredResponse.recipes);
        setRecentRecipes(recentResponse.recipes);
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-amber-50 rounded-lg p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Discover & Share Delicious Recipes
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Join our community of food lovers to find inspiration, share your culinary creations, and connect with passionate home chefs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/recipes" 
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-md text-center shadow-md transition"
              >
                Browse Recipes
              </Link>
              <Link 
                to="/register" 
                className="bg-white hover:bg-gray-100 text-amber-600 font-medium py-3 px-6 rounded-md border border-amber-600 text-center transition"
              >
                Join Community
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/uploads/hero-food.jpg" 
              alt="Delicious food" 
              className="rounded-lg shadow-lg w-full h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/uploads/default-recipe.jpg";
              }}
            />
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Recipes</h2>
          <Link to="/recipes" className="text-amber-600 hover:text-amber-700 font-medium">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRecipes.length > 0 ? (
            featuredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">No featured recipes available yet.</p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Low-Carb'].map(category => (
            <Link 
              key={category}
              to={`/recipes?category=${category}`}
              className="bg-white hover:bg-gray-50 rounded-lg shadow p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-semibold text-lg text-gray-800">{category}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Recipes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently Added</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentRecipes.length > 0 ? (
            recentRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">No recipes available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
