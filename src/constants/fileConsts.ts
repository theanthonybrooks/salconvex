export const DOC_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

export const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF document",
  "application/msword": "Word document (.doc)",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word document (.docx)",
  "application/vnd.ms-powerpoint": "PowerPoint presentation (.ppt)",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint presentation (.pptx)",
  "application/vnd.ms-excel": "Excel spreadsheet (.xls)",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Excel spreadsheet (.xlsx)",
  "image/png": "PNG image",
  "image/jpeg": "JPEG image",
  "image/gif": "GIF",
};

export const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];
export const BOTH_TYPES = [...DOC_TYPES, ...IMAGE_TYPES];
