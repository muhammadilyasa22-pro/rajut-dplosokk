const getRuntimeApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }

    return `${window.location.origin}/api`;
  }

  return "http://localhost:5000/api";
};

const API_URL = getRuntimeApiUrl();

const getRuntimeUploadUrl = () => {
  if (import.meta.env.VITE_UPLOAD_URL) {
    return import.meta.env.VITE_UPLOAD_URL.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/uploads";
    }

    return `${window.location.origin}/uploads`;
  }

  return "http://localhost:5000/uploads";
};

const configuredUploadUrl = getRuntimeUploadUrl();

const UPLOAD_URL = configuredUploadUrl
  .replace(/\\/g, "/")
  .replace(/\/+$/, "")
  .replace(/\/images$/i, "");

export const IMAGE_BASE_URL =
  `${UPLOAD_URL}/images`;

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

  // Gunakan gambar default jika nama file kosong.
  if (
    !value ||
    /^default\.(jpg|jpeg|png|webp)$/i.test(value)
  ) {
    value = "default.svg";
  }

  // Ambil nama file terakhir saja.
  value =
    value.split("/").pop() ||
    "default.svg";

  return `${IMAGE_BASE_URL}/${encodeURIComponent(value)}`;
}