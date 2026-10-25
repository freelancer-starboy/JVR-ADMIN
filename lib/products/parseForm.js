import formidable from "formidable";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // Cloudinary free plan limit per image

// Parses a multipart request (the API route must export `config.api.bodyParser = false`).
export default function parseForm(req) {
  const form = formidable({
    multiples: true,
    maxFiles: 60,
    maxFileSize: MAX_IMAGE_SIZE,
    maxTotalFileSize: 200 * 1024 * 1024,
    allowEmptyFiles: false,
    minFileSize: 1,
    filter: ({ mimetype }) => Boolean(mimetype && mimetype.startsWith("image/")),
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        const tooLarge = error.httpCode === 413 || /max(Total)?FileSize/i.test(error.message || "");
        const wrapped = new Error(
          tooLarge ? "An image is too large. Each image must be under 10 MB." : "Could not read the uploaded form"
        );
        wrapped.status = tooLarge ? 413 : 400;
        return reject(wrapped);
      }
      resolve({ fields, files });
    });
  });
}
