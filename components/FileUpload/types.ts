export interface UploadResponse {
  success: boolean;
  files: {
    filename: string;
    url: string;
    success: boolean;
  }[];
}

export interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  url?: string;
  previewUrl?: string;
}

export interface FileTypeIcon {
  path: string;
  viewBox?: string;
}
