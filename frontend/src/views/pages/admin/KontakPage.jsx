import { useState } from "react";

export default function KontakPage() { const [items] = useState([]); return <div><div className="page-actions"><div><h2>Pesan Kontak</h2><p>Pesan kontak akan tersedia setelah endpoint kontak ditambahkan di backend.</p></div></div><section className="table-card"><div className="empty-state">Belum ada pesan kontak. Backend yang kamu kirim belum menyediakan route `/api/kontak`, jadi halaman ini sengaja tidak memanggil endpoint yang belum ada.</div></section></div>; }
