import React from "react";
import NotificationProvider from "../providers/NotificationProvider";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";
import { ContextProvider } from "../providers/ContextProvider";
import Register from "../pages/register/register";
import Dashboard from "../pages/brands/Dashboard";
import Consumer from "../pages/consumer/Consumer";
import MintedNFTVoucher from "../pages/consumer/MintedNFTVoucher";

const RoutesGlobal = () => {
  return (
    <Layout>
      <Router>
        <NotificationProvider>
          <ContextProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/register" />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customer" element={<Consumer />} />
              <Route path="/minted-nft-vouchers" element={<MintedNFTVoucher/>} />
            </Routes>
          </ContextProvider>
        </NotificationProvider>
      </Router>
    </Layout>
  );
};

export default RoutesGlobal;
