export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// URL publik folder gambar backend.
// VITE_UPLOAD_URL boleh berupa:
//   http://localhost:5000/uploads
//   http://localhost:5000/uploads/images
const configuredUploadUrl =
  import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000/uploads/images";

const UPLOAD_URL = configuredUploadUrl
  .replace(/\\/g, "/")
  .replace(/\/+$/, "")
  .replace(/\/images$/i, "");

export const IMAGE_BASE_URL = `${UPLOAD_URL}/images`;

export function imageUrl(filename) {
  if (!filename) return `${IMAGE_BASE_URL}/default.svg`;

  let value = String(filename).trim().replace(/\\/g, "/");

  if (/^https?:\/\//i.test(value)) return value;

  // Bersihkan path yang mungkin tersimpan di database.
  value = value
    .replace(/^\/+/, "")
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^uploads\//i, "")
    .replace(/^images\//i, "")
    .replace(/^uploads\/images\//i, "");

  if (!value || /^default\.(jpg|jpeg|png|webp)$/i.test(value)) {
    value = "default.svg";
  }

  // Jika database menyimpan path tambahan, ambil nama file terakhir.
  // Ini membuat /uploads/images/foto.jpg dan foto.jpg sama-sama bekerja.
  value = value.split("/").pop() || "default.svg";

  return `${IMAGE_BASE_URL}/${encodeURIComponent(value)}`;
}
