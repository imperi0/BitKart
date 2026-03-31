import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Alerts from './pages/Alerts';
import Shipments from './pages/Shipments';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:id" element={<Categories />} />
            <Route path="item/:id" element={<ItemDetail />} />
            <Route path="item/create" element={
              <ProtectedRoute><CreateListing /></ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="alerts" element={
              <ProtectedRoute><Alerts /></ProtectedRoute>
            } />
            <Route path="shipments" element={
              <ProtectedRoute><Shipments /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
