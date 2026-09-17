import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProdukList from "../pages/ProdukList";
import ProdukDetail from "../pages/ProdukDetail";
import Keranjang from "../pages/Keranjang";
import Artikel from "../pages/Artikel";
import ArtikelDetail from "../pages/ArtikelDetail";
import NotFound from "../pages/NotFound";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProduk from "../pages/admin/AdminProduk";
import AdminPembelian from "../pages/admin/AdminPembelian";

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/produk" element={<ProdukList />} />
        <Route path="/produk/:id" element={<ProdukDetail />} />
        <Route path="/keranjang" element={<Keranjang />} />
        <Route path="/artikel" element={<Artikel />} />
        <Route path="/artikel/:id" element={<ArtikelDetail />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/produk"
          element={
            <ProtectedRoute adminOnly>
              <AdminProduk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pembelian"
          element={
            <ProtectedRoute adminOnly>
              <AdminPembelian />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
