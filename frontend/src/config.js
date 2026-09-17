const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://dplosokk.my.id/api";

// URL publik folder gambar backend.
const configuredUploadUrl =
  import.meta.env.VITE_UPLOAD_URL ||
  "https://dplosokk.my.id/uploads/images";

const UPLOAD_URL = configuredUploadUrl
  .replace(/\\/g, "/")
  .replace(/\/+$/, "")
  .replace(/\/images$/i, "");

export const IMAGE_BASE_URL = `${UPLOAD_URL}/images`;

export { API_URL };

export function imageUrl(filename) {
  if (!filename) {
    return `${IMAGE_BASE_URL}/default.svg`;
  }

  let value = String(filename)
    .trim()
    .replace(/\\/g, "/");

  // Jika sudah berupa URL lengkap, langsung gunakan.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Bersihkan path yang mungkin tersimpan di database.
  value = value
    .replace(/^\/+/, "")
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^uploads\/+/i, "")
    .replace(/^images\/+/i, "")
    .replace(/^uploads\/+images\/+/i, "");

  // Jika kosong atau merupakan nama default lama.
  if (
    !value ||
    /^default\.(jpg|jpeg|png|webp)$/i.test(value)
  ) {
    value = "default.svg";
  }

  // Ambil nama file terakhir.
  value =
    value.split("/").pop() ||
    "default.svg";

  return `${IMAGE_BASE_URL}/${encodeURIComponent(value)}`;
}