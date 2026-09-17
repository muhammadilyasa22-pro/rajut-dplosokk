import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./controllers/AuthContext";
import { CartProvider } from "./context/CartContext";
import RequireAuth from "./views/components/RequireAuth";
import PublicLayout from "./views/layouts/PublicLayout";
import AdminLayout from "./views/layouts/AdminLayout";
import BuyerLayout from "./views/layouts/BuyerLayout";
import HomePage from "./views/pages/HomePage";
import TokoPage from "./views/pages/TokoPage";
import ProdukDetailPage from "./views/pages/ProdukDetailPage";
import KeranjangPage from "./views/pages/KeranjangPage";
import ArtikelListPage from "./views/pages/ArtikelListPage";
import ArtikelDetailPage from "./views/pages/ArtikelDetailPage";
import LoginPage from "./views/pages/LoginPage";
import RegisterPage from "./views/pages/RegisterPage";
import DashboardPage from "./views/pages/admin/DashboardPage";
import ProdukPage from "./views/pages/admin/ProdukPage";
import PembeliPage from "./views/pages/admin/PembeliPage";
import PesananPage from "./views/pages/admin/PesananPage";
import ArtikelPage from "./views/pages/admin/ArtikelPage";
import KontakPage from "./views/pages/admin/KontakPage";
import InfoTokoPage from "./views/pages/admin/InfoTokoPage";
import AdminProfilPage from "./views/pages/admin/ProfilPage";
import PembeliDashboard from "./views/pages/pembeli/PembeliDashboard";
import PembelianPage from "./views/pages/pembeli/PembelianPage";
import ProfilPage from "./views/pages/pembeli/ProfilPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/toko" element={<TokoPage />} />
            <Route path="/produk/:id" element={<ProdukDetailPage />} />
            <Route path="/keranjang" element={<KeranjangPage />} />
            <Route path="/artikel" element={<ArtikelListPage />} />
            <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
          </Route>
          <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="produk" element={<ProdukPage />} />
            <Route path="pembeli" element={<PembeliPage />} />
            <Route path="pesanan" element={<PesananPage />} />
            <Route path="artikel" element={<ArtikelPage />} />
            <Route path="kontak" element={<KontakPage />} />
            <Route path="info-toko" element={<InfoTokoPage />} />
            <Route path="profil" element={<AdminProfilPage />} />
          </Route>
          <Route path="/pembeli" element={<RequireAuth role="pembeli"><BuyerLayout /></RequireAuth>}>
            <Route index element={<PembeliDashboard />} />
            <Route path="pesanan" element={<PembelianPage />} />
            <Route path="profil" element={<ProfilPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
