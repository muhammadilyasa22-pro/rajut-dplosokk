export default function Spinner({ label = "Memuat..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
      <div className="spinner-border text-pine" role="status" style={{ color: "var(--pine-500)" }}>
        <span className="visually-hidden">Memuat...</span>
      </div>
      <p className="small text-body-secondary mb-0">{label}</p>
    </div>
  );
}
