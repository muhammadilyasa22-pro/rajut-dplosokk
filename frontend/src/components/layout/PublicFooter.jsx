export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container footer-grid">
        <div>
          <h3>Toko Pengrajut D-PLOSOKK</h3>
          <p>Toko Pengrajut milik Bu Endang dengan pelayanan sederhana, ramah, dan terpercaya.</p>
        </div>
        <div>
          <h4>Informasi</h4>
          <p>Senin - Minggu</p>
          <p>Silakan hubungi toko untuk jam operasional terbaru.</p>
        </div>
        <div>
          <h4>Kontak</h4>
          <p>WhatsApp: Hubungi Bu Endang 081359487574</p>
          <p>Alamat: DUKUH KRAJAN II RT/RW  003/002 PLALANGAN JENANGAN PONOROGO</p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Toko Pengrajut D-PLOSOKK · Bu Endang</div>
    </footer>
  );
}
