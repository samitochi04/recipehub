import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import recipeService from '../services/recipeService';

function RecipeDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const recipeData = await recipeService.getRecipe(id);
        setRecipe(recipeData);
        
        // Fetch comments
        const commentsData = await recipeService.getComments(id);
        setComments(commentsData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe");
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      const newComment = await recipeService.addComment(id, comment);
      setComments([newComment, ...comments]);
      setComment('');
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleRate = async (rating) => {
    try {
      const response = await recipeService.rateRecipe(id, rating);
      setUserRating(rating);
      
      // Update recipe with new average rating
      setRecipe(prev => ({
        ...prev,
        average_rating: response.average_rating,
        rating_count: response.rating_count
      }));
    } catch (err) {
      console.error("Error rating recipe:", err);
    }
  };

  const toggleFavorite = async () => {
    try {
      const response = await recipeService.toggleFavorite(id);
      setIsFavorite(response.isFavorited);
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Recipe header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          {currentUser && (
            <div className="flex space-x-2">
              <button 
                onClick={toggleFavorite}
                className="flex items-center text-amber-600 hover:text-amber-800"
              >
                {isFavorite ? (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Remove favorite
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Add to favorites
                  </span>
                )}
              </button>
              {currentUser.id === recipe.user_id && (
                <Link 
                  to={`/recipes/${id}/edit`}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md"
                >
                  Edit Recipe
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <img 
            src={recipe.author_image ? `/uploads/${recipe.author_image}` : '/uploads/default-user.jpg'} 
            alt={recipe.username}
            className="w-8 h-8 rounded-full mr-2"
            onError={(e) => { e.target.src = '/uploads/default-user.jpg'; }}
          />
          <span>By {recipe.username}</span>
          <span className="mx-2">•</span>
          <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Recipe image and info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <img 
            src={recipe.image_url ? `/uploads/${recipe.image_url}` : '/uploads/default-recipe.jpg'} 
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg shadow-md"
            onError={(e) => { e.target.src = '/uploads/default-recipe.jpg'; }}
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recipe Info</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Prep Time</p>
              <p className="font-semibold">{recipe.prep_time_minutes} mins</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Cook Time</p>
              <p className="font-semibold">{recipe.cook_time_minutes} mins</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Time</p>
              <p className="font-semibold">{recipe.prep_time_minutes + recipe.cook_time_minutes} mins</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Servings</p>
              <p className="font-semibold">{recipe.servings}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600 text-sm">Difficulty</p>
            <p className="font-semibold">{recipe.difficulty}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600 text-sm">Rating</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => currentUser && handleRate(star)}
                  disabled={!currentUser}
                  className={`${currentUser ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      star <= Math.round(recipe.average_rating) ? 'text-amber-500 fill-current' : 'text-gray-300 fill-current'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-gray-600">
                ({recipe.rating_count} {recipe.rating_count === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
            {!currentUser && (
              <p className="text-xs text-gray-500 mt-1">Login to rate this recipe</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600 text-sm">Categories</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {recipe.categories?.map(category => (
                <span 
                  key={category.id}
                  className="bg-gray-100 text-gray-800 text-xs rounded-full px-3 py-1"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recipe description */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700">{recipe.description}</p>
        </div>
      </div>
      
      {/* Ingredients */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-2">
            {recipe.ingredients?.map(ingredient => (
              <li key={ingredient.id} className="flex items-start">
                <span className="flex items-center justify-center bg-amber-500 text-white rounded-full w-6 h-6 mr-3 mt-0.5">•</span>
                <span>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  {ingredient.notes && <span className="text-gray-500 ml-2">({ingredient.notes})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ol className="space-y-4">
            {recipe.instructions?.map(instruction => (
              <li key={instruction.id} className="flex">
                <span className="flex items-center justify-center bg-amber-600 text-white rounded-full w-8 h-8 mr-4 shrink-0">
                  {instruction.step_number}
                </span>
                <p className="pt-1">{instruction.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Comments */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        
        {/* Comment form */}
        {currentUser ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <div className="mt-3 text-right">
              <button 
                type="submit" 
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!comment.trim()}
                style={{
                  backgroundColor: !comment.trim() ? '#ea580c' : '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  minHeight: '40px'
                }}
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-6">
            <p className="text-gray-600">Please <Link to="/login" className="text-orange-600 hover:underline">log in</Link> to leave a comment.</p>
          </div>
        )}
        
        {/* Comments list */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center mb-2">
                  <img 
                    src={comment.profile_image ? `/uploads/${comment.profile_image}` : '/uploads/default-user.jpg'} 
                    alt={comment.username} 
                    className="w-8 h-8 rounded-full mr-2"
                    onError={(e) => { e.target.src = '/uploads/default-user.jpg'; }}
                  />
                  <div>
                    <p className="font-semibold">{comment.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;