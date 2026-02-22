import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardPage from './pages/DashboardPage';
import SectionsPage from './pages/SectionsPage';
import ProductsPage from './pages/ProductsPage';
import BrandsPage from './pages/BrandsPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import UsersPage from './pages/UsersPage';
import MessagesPage from './pages/MessagesPage';
import AccountInfoPage from '../account/pages/AccountInfoPage';

const AdminApp = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="sections" element={<SectionsPage />} />
        <Route path="informations" element={<AccountInfoPage />} />

        <Route path="produits" element={<ProductsPage />} />
        <Route path="marques" element={<BrandsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="commandes" element={<OrdersPage />} />
        <Route path="commandes/:id" element={<OrderDetailsPage />} />
        <Route path="utilisateurs" element={<UsersPage />} />
        <Route path="messages" element={<MessagesPage />} />

        {/* Backward compatibility */}
        <Route path="products" element={<Navigate to="/admin/produits" replace />} />
        <Route path="brands" element={<Navigate to="/admin/marques" replace />} />
        <Route path="orders" element={<Navigate to="/admin/commandes" replace />} />
        <Route path="orders/:id" element={<Navigate to="/admin/commandes" replace />} />
        <Route path="users" element={<Navigate to="/admin/utilisateurs" replace />} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
