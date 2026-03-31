import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';

export default function Categories() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes] = await Promise.all([
        axios.get('/api/categories/tree')
      ]);
      setCategories(catsRes.data.categories);

      if (id) {
        const itemsRes = await axios.get(`/api/items?cat_id=${id}`);
        setItems(itemsRes.data.items);
        setPagination(itemsRes.data.pagination);
        
        const cat = catsRes.data.categories.flat().find(c => c.cat_id === parseInt(id));
        setCategory(cat);
      } else {
        const itemsRes = await axios.get('/api/items');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <nav className="space-y-1">
              <a
                href="/categories"
                className={`block px-3 py-2 rounded-lg ${!id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Items
              </a>
              {flatCategories.map(cat => (
                <a
                  key={cat.cat_id}
                  href={`/categories/${cat.cat_id}`}
                  className={`block px-3 py-2 rounded-lg ${id == cat.cat_id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  style={{ paddingLeft: `${1 + (cat.depth || 0)}rem` }}
                >
                  {cat.cat_name}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{category?.cat_name || 'Browse Items'}</h1>
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
            <div className="text-center py-12">
              <p className="text-gray-500">No items found in this category</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
