import type { FilePondFile } from "filepond"; // import type only
import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";
import FilePondPluginFileRename from "filepond-plugin-file-rename";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

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

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];
const BOTH_TYPES = [...DOC_TYPES, ...IMAGE_TYPES];

type ActualFileObject = FilePondFile["file"];

type FilePondInputProps = {
  value: ActualFileObject[];
  onChange: (files: ActualFileObject[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: string;
  maxFiles?: number;
  purpose: "docs" | "images";
};

export function FilePondInput({
  value,
  onChange,
  acceptedFileTypes = ["application/pdf"],
  maxFileSize = "1MB",
  maxFiles = 5,
  purpose,
}: FilePondInputProps) {
  //   const UserAcceptedFileTypes = purpose === "docs" ? DOC_TYPES : ["image/*"];
  const UserAcceptedFileTypes = purpose === "docs" ? BOTH_TYPES : ["image/*"];

  return (
    <FilePond
      allowMultiple
      //   allowFileMetadata
      //   fileMetadataObject={{ customName: "sinfully named file" }}
      acceptedFileTypes={UserAcceptedFileTypes ?? acceptedFileTypes}
      maxFileSize={maxFileSize}
      maxFiles={maxFiles}
      allowFileRename
      //   fileRenameFunction={(file) => `${Date.now()}-${file.name}`}
      files={value}
      onupdatefiles={(fileItems: FilePondFile[]) => {
        const files = fileItems.map((item) => item.file);
        onChange(files);
      }}
      server={null}
      instantUpload={false}
    />
  );
}
