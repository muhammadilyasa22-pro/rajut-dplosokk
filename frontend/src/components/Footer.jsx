import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-pine-dark text-white mt-5 pt-5">
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle font-display fw-bold"
                style={{ width: 32, height: 32, backgroundColor: "var(--marigold-500)", color: "var(--pine-700)" }}
              >
                D
              </span>
              <span className="font-display fw-semibold fs-5">Toko Pengrajut D-PLOSOKK</span>
            </div>
            <p className="small text-white-50">
              Belanja kebutuhan harian langsung dari toko pengrajut kampung — dekat, jujur harganya, dan selalu ready stok.
            </p>
          </div>
          <div className="col-md-4">
            <p className="text-uppercase small fw-semibold mb-3" style={{ color: "var(--marigold-400)", letterSpacing: "0.1em" }}>Jelajah</p>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/produk" className="link-light text-decoration-none text-white-50">Semua Produk</Link></li>
              <li className="mb-2"><Link to="/artikel" className="link-light text-decoration-none text-white-50">Artikel</Link></li>
              <li className="mb-2"><Link to="/keranjang" className="link-light text-decoration-none text-white-50">Keranjang</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <p className="text-uppercase small fw-semibold mb-3" style={{ color: "var(--marigold-400)", letterSpacing: "0.1em" }}>Kontak Toko Pengrajut</p>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-2">Buka setiap hari, 10.00 – 21.00</li>
              <li className="mb-2">WhatsApp: 081359487574</li>
              <li className="mb-2">Alamat Toko Pengrajut, DUKUH KRAJAN II RT/RW  003/002 PLALANGAN JENANGAN PONOROGO</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-top border-white border-opacity-10 py-3 text-center small text-white-50">
        © {new Date().getFullYear()} Toko Pengrajut D-PLOSOKK. Dibuat dengan niat baik.
      </div>
    </footer>
  );
}
