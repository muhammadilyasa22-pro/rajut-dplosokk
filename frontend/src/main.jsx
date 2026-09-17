import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// StrictMode sengaja tidak dipakai pada aplikasi ini karena mode development
// dapat menjalankan effect dua kali dan membuat request halaman admin terlihat
// seperti berkedip ketika backend sedang lambat/restart.
createRoot(document.getElementById("root")).render(<App />);
