import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AccountLayout from './AccountLayout';
import AccountInfoPage from './pages/AccountInfoPage';
import AccountOrdersPage from './pages/AccountOrdersPage';

const AccountApp = () => {
  return (
    <Routes>
      <Route element={<AccountLayout />}>
        <Route index element={<AccountInfoPage />} />
        <Route path="informations" element={<AccountInfoPage />} />
        <Route path="orders" element={<AccountOrdersPage />} />
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Route>
    </Routes>
  );
};

export default AccountApp;
