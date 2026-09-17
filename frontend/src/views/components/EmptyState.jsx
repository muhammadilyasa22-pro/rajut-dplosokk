export default function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-5 px-3">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
        style={{ width: 56, height: 56, backgroundColor: "var(--pine-50)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pine-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="font-display fw-semibold fs-5 mb-1">{title}</p>
      {hint && <p className="small text-body-secondary mb-0">{hint}</p>}
    </div>
  );
}
