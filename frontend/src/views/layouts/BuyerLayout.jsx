import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BuyerSidebar from "../components/buyer/BuyerSidebar";
import BuyerHeader from "../components/buyer/BuyerHeader";
const titles = { "/pembeli":"Dashboard", "/pembeli/pesanan":"Pesanan Saya", "/pembeli/profil":"Profil Saya" };
export default function BuyerLayout() {
  const [open,setOpen]=useState(false); const location=useLocation(); const title=titles[location.pathname]||"Panel Pembeli";
  return <div className="admin-shell buyer-shell"><BuyerSidebar open={open} onClose={()=>setOpen(false)}/>{open&&<button className="sidebar-overlay" onClick={()=>setOpen(false)} aria-label="Tutup menu"/>}<div className="admin-main"><BuyerHeader title={title} onMenu={()=>setOpen(true)}/><main className="admin-content buyer-content"><Outlet/></main></div></div>;
}
