import { H3Error } from "h3";

export default defineEventHandler(async (event) => {
  // Parse multipart form data
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No files uploaded",
    });
  }

  // Get storage instance
  const storage = useStorage("uploads");
  const uploadedFiles = [];

  try {
    // Process each file in the form data
    for (const file of formData) {
      // Validate file size (5MB limit)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.data.length > MAX_FILE_SIZE) {
        throw createError({
          statusCode: 400,
          statusMessage: `File ${file.filename} exceeds maximum size of 5MB`,
        });
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "text/plain",
      ];

      if (!file.type || !allowedTypes.includes(file.type)) {
        throw createError({
          statusCode: 400,
          statusMessage: `File type ${
            file.type || "unknown"
          } not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        });
      }

      if (!file || !file.filename) {
        console.warn("Skipping invalid file entry");
        continue;
      }

      // Store file using useStorage
      const fileName = `${Date.now()}-${file.filename}`;
      await storage.setItemRaw(`${fileName}`, file.data);
      uploadedFiles.push({
        filename: fileName,
        url: `/uploads/${fileName}`,
      });
    }

    return {
      files: uploadedFiles,
    };
  } catch (error) {
    if (error instanceof H3Error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Error uploading files",
    });
  }
});
