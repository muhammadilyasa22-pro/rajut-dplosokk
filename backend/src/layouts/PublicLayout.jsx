import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";

export default function PublicLayout() {
  return (
    <div className="site-shell">
      <PublicNavbar />
      <main><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
