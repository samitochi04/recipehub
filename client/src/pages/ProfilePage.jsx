import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/recipes/RecipeCard';
import recipeService from '../services/recipeService';

function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userRecipes, setUserRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      username: '',
      bio: ''
    }
  });

  // Watch form values to ensure they're never undefined
  const watchedUsername = watch('username');
  const watchedBio = watch('bio');

  useEffect(() => {
    if (currentUser) {
      // Set form values ensuring they're never undefined
      setValue('username', currentUser.username || '');
      setValue('bio', currentUser.bio || '');
      setImagePreview(currentUser.profile_image ? `/uploads/${currentUser.profile_image}` : null);
    }
  }, [currentUser, setValue]);

  useEffect(() => {
    if (activeTab === 'recipes') {
      fetchUserRecipes();
    } else if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]);

  const fetchUserRecipes = async () => {
    setLoadingRecipes(true);
    try {
      console.log('Fetching user recipes...');
      const data = await recipeService.getUserRecipes();
      console.log('User recipes data:', data);
      
      // Handle different response structures
      if (data.recipes) {
        setUserRecipes(data.recipes);
      } else if (Array.isArray(data)) {
        setUserRecipes(data);
      } else {
        setUserRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      setUserRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const fetchFavorites = async () => {
    setLoadingRecipes(true);
    try {
      console.log('Fetching user favorites...');
      const data = await recipeService.getUserFavorites();
      console.log('User favorites data:', data);
      
      // Handle different response structures
      if (data.recipes) {
        setFavoriteRecipes(data.recipes);
      } else if (data.favorites) {
        setFavoriteRecipes(data.favorites);
      } else if (Array.isArray(data)) {
        setFavoriteRecipes(data);
      } else {
        setFavoriteRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavoriteRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // Ensure values are never undefined
      formData.append('username', data.username || '');
      formData.append('bio', data.bio || '');
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput?.files[0]) {
        formData.append('profile_image', fileInput.files[0]);
      }

      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={imagePreview || `/uploads/${currentUser.profile_image}` || '/uploads/default-user.jpg'}
              alt={currentUser.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-500"
              onError={(e) => { e.target.src = '/uploads/default-user.jpg'; }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{currentUser.username}</h1>
            <p className="text-gray-600">{currentUser.email}</p>
            <p className="text-gray-600 mt-2">{currentUser.bio || 'No bio yet'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['profile', 'recipes', 'favorites'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'profile' ? 'Edit Profile' : tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={imagePreview || `/uploads/${currentUser.profile_image}` || '/uploads/default-user.jpg'}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => { e.target.src = '/uploads/default-user.jpg'; }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'recipes' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Recipes</h2>
                <Link 
                  to="/recipes/create"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  Create New Recipe
                </Link>
              </div>
              
              {loadingRecipes ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                </div>
              ) : userRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't created any recipes yet</p>
                  <Link
                    to="/recipes/create"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition"
                  >
                    Create Your First Recipe
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'favorites' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Favorite Recipes</h2>
              
              {loadingRecipes ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                </div>
              ) : favoriteRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You don't have any favorite recipes yet</p>
                  <Link
                    to="/recipes"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition"
                  >
                    Browse Recipes
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
