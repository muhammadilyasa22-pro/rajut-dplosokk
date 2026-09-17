import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const titles = {
  "/admin": "Dashboard",
  "/admin/produk": "Kelola Produk",
  "/admin/pembeli": "Kelola Pembeli",
  "/admin/pesanan": "Kelola Pesanan",
  "/admin/artikel": "Kelola Artikel",
  "/admin/kontak": "Pesan Kontak",
  "/admin/info-toko": "Info Toko",
  "/admin/profil": "Profil Saya"
};

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || "Panel Admin";

  return (
    <div className="admin-shell">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Tutup menu" />}
      <div className="admin-main">
        <AdminHeader title={title} onMenu={() => setOpen(true)} />
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
