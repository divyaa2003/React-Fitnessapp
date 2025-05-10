import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NutritionTracker() {
  const [foodItems, setFoodItems] = useState([
    { id: 1, name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, meal: 'breakfast' },
    { id: 2, name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, meal: 'breakfast' },
    { id: 3, name: 'Grilled Chicken Salad', calories: 350, protein: 30, carbs: 10, fat: 15, meal: 'lunch' },
    { id: 4, name: 'Protein Shake', calories: 200, protein: 25, carbs: 5, fat: 3, meal: 'snack' }
  ]);
  
  const [newItem, setNewItem] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meal: 'breakfast'
  });

  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  const calculateTotals = () => {
    return foodItems.reduce((acc, item) => {
      return {
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };
  
  const totals = calculateTotals();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'name' ? value : value === '' ? '' : parseFloat(value)
    }));
  };
  
  const handleAddItem = () => {
    if (!newItem.name || !newItem.calories) return;
    
    setFoodItems(prev => [
      ...prev,
      {
        id: Date.now(),
        ...newItem
      }
    ]);
    
    setNewItem({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      meal: 'breakfast'
    });
  };
  
  const handleDeleteItem = (id) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Nutrition Tracker</h1>
        
        {/* Nutrition Summary */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-1">Calories</h3>
              <p className="text-2xl font-bold text-blue-400">{totals.calories}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-1">Protein</h3>
              <p className="text-2xl font-bold text-green-400">{totals.protein}g</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-1">Carbs</h3>
              <p className="text-2xl font-bold text-yellow-400">{totals.carbs}g</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-1">Fat</h3>
              <p className="text-2xl font-bold text-red-400">{totals.fat}g</p>
            </div>
          </div>
          
          {/* Macronutrient Distribution */}
          <div className="mt-6">
            <h3 className="text-sm text-slate-400 mb-2">Macronutrient Distribution</h3>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-green-400 h-full" 
                style={{ width: `${(totals.protein * 4 / totals.calories) * 100 || 0}%` }}
              ></div>
              <div 
                className="bg-yellow-400 h-full" 
                style={{ width: `${(totals.carbs * 4 / totals.calories) * 100 || 0}%` }}
              ></div>
              <div 
                className="bg-red-400 h-full" 
                style={{ width: `${(totals.fat * 9 / totals.calories) * 100 || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-green-400">Protein {Math.round((totals.protein * 4 / totals.calories) * 100 || 0)}%</span>
              <span className="text-yellow-400">Carbs {Math.round((totals.carbs * 4 / totals.calories) * 100 || 0)}%</span>
              <span className="text-red-400">Fat {Math.round((totals.fat * 9 / totals.calories) * 100 || 0)}%</span>
            </div>
          </div>
        </div>
        
        {/* Add Food Form */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Food Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Food Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Grilled Chicken"
              />
            </div>
            <div>
              <label htmlFor="calories" className="block text-sm font-medium mb-1">
                Calories
              </label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={newItem.calories}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="kcal"
              />
            </div>
            <div>
              <label htmlFor="protein" className="block text-sm font-medium mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={newItem.protein}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="g"
              />
            </div>
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={newItem.carbs}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="g"
              />
            </div>
            <div>
              <label htmlFor="fat" className="block text-sm font-medium mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={newItem.fat}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="g"
              />
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="meal" className="block text-sm font-medium mb-1">
                Meal
              </label>
              <select
                id="meal"
                name="meal"
                value={newItem.meal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                {meals.map(meal => (
                  <option key={meal} value={meal}>
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddItem}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
        
        {/* Food Log */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Food Log</h2>
          
          {meals.map(meal => {
            const mealFoodItems = foodItems.filter(item => item.meal === meal);
            
            return (
              <div key={meal} className="mb-6">
                <h3 className="text-lg font-medium capitalize mb-3">{meal}</h3>
                
                {mealFoodItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Food</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Calories</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Protein</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Carbs</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {mealFoodItems.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.calories}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.protein}g</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.carbs}g</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.fat}g</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No items added for this meal</p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
