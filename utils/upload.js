import { redirectToLogin } from "./api/baseApi";

// Sends multipart form data with upload progress (fetch can't report upload progress).
export function sendForm({ url, method = "POST", formData, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      const data = xhr.response || {};
      if (xhr.status === 401) {
        redirectToLogin();
        reject(new Error("Your session has expired. Please log in again."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message || `Request failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error - check your connection and try again"));
    xhr.ontimeout = () => reject(new Error("The upload timed out. Try fewer or smaller images."));

    xhr.send(formData);
  });
}
