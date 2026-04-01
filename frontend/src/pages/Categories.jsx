import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { 
  Laptop, Shirt, Home, Dumbbell, BookOpen, Car, 
  Smartphone, Camera, Headphones, Gem, UtensilsCrossed, 
  Flower2, Bike, Watch, Gamepad2, PawPrint, Baby, 
  Music, Watch as WatchIcon, Sofa
} from 'lucide-react';

const categoryIcons = {
  'Electronics': Laptop,
  'Smartphones': Smartphone,
  'Laptops': Laptop,
  'Cameras': Camera,
  'Audio': Headphones,
  'Fashion': Shirt,
  "Men's Clothing": Shirt,
  "Women's Clothing": Shirt,
  'Shoes': ShoeIcon,
  'Jewelry': Gem,
  'Home & Garden': Home,
  'Living Room': Sofa,
  'Kitchen': UtensilsCrossed,
  'Garden Tools': Flower2,
  'Sports': Dumbbell,
  'Fitness': Dumbbell,
  'Team Sports': Gamepad2,
  'Books': BookOpen,
  'Fiction': BookOpen,
  'Non-Fiction': BookOpen,
  'Vehicles': Car,
  'Cars': Car,
  'Motorcycles': Bike,
};

function ShoeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 15c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H9.6a2 2 0 0 0-1.8-1l-2.4-1.2a1.5 1.5 0 0 0-1.4.2L3 12V15Z"/>
      <path d="M3.85 12.8 5 13c.7.4 1.5.6 2.3.6h1.5"/>
      <path d="M4.4 9.5 3 10.5"/>
      <path d="M5.7 6.3 6.5 7c.8.9 1.9 1.5 3.1 1.8l.5.1"/>
      <path d="M10 6l3-2 2 2-2 2.5"/>
      <path d="M15 7l1.5-1.5"/>
      <path d="M18 5l2 1"/>
    </svg>
  );
}

function getCategoryIcon(catName, size = 20) {
  const IconComponent = categoryIcons[catName];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  return <BookOpen size={size} />;
}

function getCategoryColor(catName) {
  const colors = {
    'Electronics': 'from-blue-500 to-blue-600',
    'Smartphones': 'from-blue-400 to-blue-500',
    'Laptops': 'from-blue-500 to-blue-700',
    'Cameras': 'from-amber-500 to-amber-600',
    'Audio': 'from-purple-500 to-purple-600',
    'Fashion': 'from-pink-500 to-pink-600',
    "Men's Clothing": 'from-pink-400 to-pink-500',
    "Women's Clothing": 'from-rose-500 to-rose-600',
    'Shoes': 'from-orange-500 to-orange-600',
    'Jewelry': 'from-yellow-500 to-yellow-600',
    'Home & Garden': 'from-green-500 to-green-600',
    'Living Room': 'from-green-400 to-green-500',
    'Kitchen': 'from-teal-500 to-teal-600',
    'Garden Tools': 'from-emerald-500 to-emerald-600',
    'Sports': 'from-red-500 to-red-600',
    'Fitness': 'from-red-500 to-red-700',
    'Team Sports': 'from-orange-500 to-orange-600',
    'Books': 'from-amber-700 to-amber-800',
    'Fiction': 'from-indigo-500 to-indigo-600',
    'Non-Fiction': 'from-slate-600 to-slate-700',
    'Vehicles': 'from-gray-600 to-gray-700',
    'Cars': 'from-gray-500 to-gray-700',
    'Motorcycles': 'from-gray-700 to-gray-900',
  };
  return colors[catName] || 'from-gray-500 to-gray-600';
}

export default function Categories() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    fetchData(1);
  }, [id]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [catsRes] = await Promise.all([
        axios.get('/api/categories/tree')
      ]);
      setCategories(catsRes.data.categories);

      if (id) {
        const itemsRes = await axios.get(`/api/items?cat_id=${id}&page=${page}`);
        setItems(itemsRes.data.items);
        setPagination(itemsRes.data.pagination);
        
        const cat = catsRes.data.categories.flat().find(c => c.cat_id === parseInt(id));
        setCategory(cat);
      } else {
        const itemsRes = await axios.get(`/api/items?page=${page}`);
        setItems(itemsRes.data.items);
        setPagination(itemsRes.data.pagination);
        setCategory({ cat_name: 'All Items' });
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const flattenCategories = (cats, depth = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, depth });
      if (cat.children?.length) {
        result = result.concat(flattenCategories(cat.children, depth + 1));
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);
  const topCategories = categories.filter(c => !c.parent_cat_id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {!id && topCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topCategories.map(cat => (
              <Link
                key={cat.cat_id}
                to={`/categories/${cat.cat_id}`}
                className="group flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary-200"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(cat.cat_name)} flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform`}>
                  {getCategoryIcon(cat.cat_name, 28)}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-primary-600 transition-colors">
                  {cat.cat_name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Categories
            </h3>
            <nav className="space-y-1">
              <Link
                to="/categories"
                className={`flex items-center px-3 py-2 rounded-lg ${!id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">
                  <Home size={18} />
                </span>
                All Items
              </Link>
              {flatCategories.map(cat => (
                <Link
                  key={cat.cat_id}
                  to={`/categories/${cat.cat_id}`}
                  className={`flex items-center px-3 py-2 rounded-lg ${id == cat.cat_id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={{ paddingLeft: `${1 + (cat.depth || 0)}rem` }}
                >
                  <span className="w-5 h-5 mr-3 flex items-center justify-center text-gray-400">
                    {getCategoryIcon(cat.cat_name, 16)}
                  </span>
                  {cat.cat_name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {category && (
                <span className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(category.cat_name)} flex items-center justify-center text-white mr-3`}>
                  {getCategoryIcon(category.cat_name, 22)}
                </span>
              )}
              {category?.cat_name || 'Browse Items'}
            </h1>
            <p className="text-gray-600 mt-1">
              {pagination.total} {pagination.total === 1 ? 'item' : 'items'} available
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-gray-200 h-48"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <ItemCard key={item.item_id} item={item} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchData(i + 1)}
                      className={`px-4 py-2 rounded-lg ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500">No items found in this category</p>
              <Link to="/categories" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                Browse all items
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
