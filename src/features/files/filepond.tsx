import type { FilePondFile } from "filepond"; // import type only
import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";
import FilePondPluginFileRename from "filepond-plugin-file-rename";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { toast } from "react-toastify";

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginFileRename,
  FilePondPluginFileMetadata,
);

const DOC_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
];

const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF document",
  "application/msword": "Word document (.doc)",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word document (.docx)",
  "application/vnd.ms-powerpoint": "PowerPoint presentation (.ppt)",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint presentation (.pptx)",
  "image/png": "PNG image",
  "image/jpeg": "JPEG image",
  "image/gif": "GIF",
};

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const BOTH_TYPES = [...DOC_TYPES, ...IMAGE_TYPES];

type ActualFileObject = FilePondFile["file"];

type FilePondInputProps = {
  value: ActualFileObject[];
  onChange: (files: ActualFileObject[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: string;
  maxFiles?: number;
  purpose: "docs" | "images" | "both";
  disabled?: boolean;
  currentFileList?: string[];
};

export function FilePondInput({
  value,
  onChange,
  acceptedFileTypes = ["application/pdf"],
  maxFileSize = "1MB",
  maxFiles = 5,
  purpose,
  disabled,
  currentFileList,
}: FilePondInputProps) {
  //   const UserAcceptedFileTypes = purpose === "docs" ? DOC_TYPES : ["image/*"];
  const docsOnly = purpose === "docs";
  //   const imagesOnly = purpose === "images";
  const multiPurpose = purpose === "both";
  const UserAcceptedFileTypes = docsOnly
    ? DOC_TYPES
    : multiPurpose
      ? BOTH_TYPES
      : ["image/*"];
  return (
    <FilePond
      disabled={disabled}
      allowMultiple
      //   allowFileMetadata
      //   fileMetadataObject={{ customName: "sinfully named file" }}
      acceptedFileTypes={UserAcceptedFileTypes ?? acceptedFileTypes}
      maxFileSize={maxFileSize}
      maxFiles={maxFiles}
      allowFileRename
      //   fileRenameFunction={(file) => `${Date.now()}-${file.name}`}
      files={value}
      //   onupdatefiles={(fileItems: FilePondFile[]) => {
      //     const files = fileItems.map((item) => item.file);
      //     onChange(files);
      //   }}
      onupdatefiles={(fileItems) => {
        const maxSizeByType: Record<string, number> = {
          "application/pdf": 2.5, // MB
          "application/msword": 2.5, // MB
          "application/docx": 2.5, // MB
          "application/doc": 2.5, // MB
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": 2.5, // MB
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 2.5, // MB
          "application/vnd.ms-powerpoint": 2.5, // MB
          "image/png": 2,
          "image/jpeg": 2,
          "image/gif": 2,
        };

        const filteredItems = fileItems.filter((item) => {
          const file = item.file;
          const sizeMB = file.size / (1024 * 1024);
          const allowedSize = maxSizeByType[file.type] ?? 1;
          const label = FILE_TYPE_LABELS[file.type] ?? file.type;

          // console.log(file.type, allowedSize, sizeMB, label);
          if (currentFileList?.includes(file.name)) {
            toast.error(`${file.name} already exists in your file list`, {
              toastId: "filename-duplicate",
            });

            return false;
          }

          if (sizeMB > allowedSize) {
            toast.error(
              `${file.name} exceeds the ${allowedSize}MB limit for ${label}s`,
              {
                toastId: "file-upload-error",
              },
            );

            return false;
          }

          return true;
        });

        onChange(filteredItems.map((item) => item.file));
      }}
      server={null}
      instantUpload={false}
    />
  );
}
