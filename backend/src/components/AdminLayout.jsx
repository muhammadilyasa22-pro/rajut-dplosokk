import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Ringkasan", end: true },
  { to: "/admin/produk", label: "Produk" },
  { to: "/admin/pembelian", label: "Pembelian" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="container py-5">
      <div className="row g-4">
        <aside className="col-md-3">
          <p className="price-mono small text-uppercase text-body-secondary mb-3" style={{ letterSpacing: "0.1em", fontSize: 11 }}>Dashboard Admin</p>
          <nav className="nav flex-md-column gap-1 flex-row overflow-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link text-nowrap rounded-3 px-3 py-2 small fw-medium ${isActive ? "bg-pine text-white" : "text-dark"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="col-md-9 min-w-0">{children}</div>
      </div>
    </div>
  );
}
