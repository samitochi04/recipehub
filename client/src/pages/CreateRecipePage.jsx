import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import recipeService from '../services/recipeService';

function CreateRecipePage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '', notes: '' }]);
  const [instructions, setInstructions] = useState([{ step_number: 1, description: '' }]);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories (in a real app)
    // For now, we'll use hardcoded categories
    setCategories([
      { id: 1, name: 'Breakfast' },
      { id: 2, name: 'Lunch' },
      { id: 3, name: 'Dinner' },
      { id: 4, name: 'Dessert' },
      { id: 5, name: 'Appetizer' },
      { id: 6, name: 'Soup' },
      { id: 7, name: 'Salad' },
      { id: 8, name: 'Vegetarian' },
      { id: 9, name: 'Vegan' },
      { id: 10, name: 'Gluten-Free' },
    ]);
  }, []);

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

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '', notes: '' }]);
  };

  const removeIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    const nextStep = instructions.length + 1;
    setInstructions([...instructions, { step_number: nextStep, description: '' }]);
  };

  const removeInstruction = (index) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    // Update step numbers
    newInstructions.forEach((instruction, i) => {
      instruction.step_number = i + 1;
    });
    setInstructions(newInstructions);
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index].description = value;
    setInstructions(newInstructions);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      // Create form data for image upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('prep_time_minutes', data.prep_time_minutes);
      formData.append('cook_time_minutes', data.cook_time_minutes);
      formData.append('servings', data.servings);
      formData.append('difficulty', data.difficulty);
      
      // Add image if present
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }
      
      // Add ingredients and instructions as JSON strings
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('instructions', JSON.stringify(instructions));
      
      // Add selected categories
      const selectedCategories = Object.keys(data.categories || {})
        .filter(id => data.categories[id])
        .map(id => parseInt(id));
      
      formData.append('categories', JSON.stringify(selectedCategories));
      
      // Submit the recipe
      const response = await recipeService.createRecipe(formData);
      
      navigate(`/recipes/${response.recipe.id}`);
    } catch (err) {
      console.error('Create recipe error:', err);
      setError(err.response?.data?.message || 'Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Recipe</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Recipe Title*</label>
              <input
                type="text"
                id="title"
                className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                id="description"
                rows="3"
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                {...register('description', { required: 'Description is required' })}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Recipe Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                className="w-full"
                {...register('image')}
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="h-40 object-cover rounded-md" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recipe Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recipe Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="prep_time_minutes" className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)*</label>
              <input
                type="number"
                id="prep_time_minutes"
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.prep_time_minutes ? 'border-red-500' : 'border-gray-300'}`}
                {...register('prep_time_minutes', { 
                  required: 'Prep time is required',
                  min: { value: 0, message: 'Prep time cannot be negative' }
                })}
              />
              {errors.prep_time_minutes && <p className="mt-1 text-sm text-red-600">{errors.prep_time_minutes.message}</p>}
            </div>
            
            <div>
              <label htmlFor="cook_time_minutes" className="block text-sm font-medium text-gray-700 mb-1">Cook Time (minutes)*</label>
              <input
                type="number"
                id="cook_time_minutes"
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.cook_time_minutes ? 'border-red-500' : 'border-gray-300'}`}
                {...register('cook_time_minutes', { 
                  required: 'Cook time is required',
                  min: { value: 0, message: 'Cook time cannot be negative' }
                })}
              />
              {errors.cook_time_minutes && <p className="mt-1 text-sm text-red-600">{errors.cook_time_minutes.message}</p>}
            </div>
            
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">Servings*</label>
              <input
                type="number"
                id="servings"
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${errors.servings ? 'border-red-500' : 'border-gray-300'}`}
                {...register('servings', { 
                  required: 'Number of servings is required',
                  min: { value: 1, message: 'Servings must be at least 1' }
                })}
              />
              {errors.servings && <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>}
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty*</label>
              <select
                id="difficulty"
                className={`w-full px-3 py-2 border rounded-md ${errors.difficulty ? 'border-red-500' : 'border-gray-300'}`}
                {...register('difficulty', { required: 'Difficulty level is required' })}
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {errors.difficulty && <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>}
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  value={category.id}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  {...register(`categories.${category.id}`)}
                />
                <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ingredients */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor={`ingredient-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                  type="text"
                  id={`ingredient-name-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="w-24">
                <label htmlFor={`ingredient-quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                <input
                  type="text"
                  id={`ingredient-quantity-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  required
                />
              </div>
              
              <div className="w-24">
                <label htmlFor={`ingredient-unit-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  id={`ingredient-unit-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  placeholder="g, ml, cup"
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor={`ingredient-notes-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <div className="flex">
                  <input
                    type="text"
                    id={`ingredient-notes-${index}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={ingredient.notes}
                    onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    placeholder="Optional notes"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-r-md"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md"
          >
            Add Ingredient
          </button>
        </div>
        
        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center bg-amber-600 text-white rounded-full w-8 h-8">
                  {instruction.step_number}
                </div>
              </div>
              
              <div className="flex-1">
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={instruction.description}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder="Enter step instructions"
                  required
                ></textarea>
              </div>
              
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="ml-3 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addInstruction}
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md"
          >
            Add Step
          </button>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-md font-medium text-lg"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRecipePage;
