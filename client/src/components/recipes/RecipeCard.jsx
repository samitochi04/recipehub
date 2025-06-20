import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
  const defaultImage = '/uploads/default-recipe.jpg';

  return (
    <Link to={`/recipes/${recipe.id}`} className="block hover:shadow-lg transition-shadow">
      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="h-48 overflow-hidden relative">
          <img 
            src={recipe.image_url ? `/uploads/${recipe.image_url}` : defaultImage}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          {recipe.difficulty && (
            <span 
              className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white
                ${recipe.difficulty === 'Easy' ? 'bg-green-500' : 
                  recipe.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`
              }
            >
              {recipe.difficulty}
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 text-gray-800 truncate">{recipe.title}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {recipe.prep_time_minutes + recipe.cook_time_minutes} mins
            </span>
            
            <span className="mx-2">•</span>
            
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {recipe.servings} servings
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(recipe.average_rating) ? 'fill-current' : 'stroke-current fill-none'}`} 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm ml-1 text-gray-600">({recipe.rating_count || 0})</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center mt-3 text-xs">
            <img 
              src={recipe.author_image || '/images/default-user.jpg'} 
              alt={recipe.username}
              className="w-6 h-6 rounded-full mr-2"
              onError={(e) => { e.target.src = '/images/default-user.jpg'; }}
            />
            <span className="text-gray-500">By {recipe.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
