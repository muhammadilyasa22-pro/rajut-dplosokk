const API_URL =
  "https://rajut-dplosokk-9g6n.vercel.app/api";

const UPLOAD_URL =
  "https://rajut-dplosokk-9g6n.vercel.app/uploads";

const IMAGE_BASE_URL =
  "https://rajut-dplosokk-9g6n.vercel.app/uploads/images";

export {
  API_URL,
  UPLOAD_URL,
  IMAGE_BASE_URL
};

export function imageUrl(filename) {
  if (!filename) {
    return `${IMAGE_BASE_URL}/default.svg`;
  }

  let value = String(filename)
    .trim()
    .replace(/\\/g, "/");

  // Jika sudah berupa URL lengkap
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Bersihkan path dari database
  value = value
    .replace(/^\/+/, "")
    .replace(/^uploads\/+/i, "")
    .replace(/^images\/+/i, "");

  // Ambil nama file terakhir
  value =
    value.split("/").pop() ||
    "default.svg";

  // Jika nama file kosong
  if (!value) {
    value = "default.svg";
  }

  return `${IMAGE_BASE_URL}/${encodeURIComponent(value)}`;
}
