import type { FilePondFile, FilePond as FilePondInstance } from "filepond"; // import type only
import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";

import {
  BOTH_TYPES,
  DOC_TYPES,
  FILE_TYPE_LABELS,
} from "@/constants/fileConsts";
import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";
import FilePondPluginFileRename from "filepond-plugin-file-rename";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginFileRename,
  FilePondPluginFileMetadata,
);

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
  const currentFileListRef = useRef<string[] | undefined>(currentFileList);
  const pondRef = useRef<FilePondInstance | null>(null);

  useEffect(() => {
    currentFileListRef.current = currentFileList;
  }, [currentFileList]);

  //   const UserAcceptedFileTypes = purpose === "docs" ? DOC_TYPES : ["image/*"];
  const docsOnly = purpose === "docs";
  //   const imagesOnly = purpose === "images";
  const multiPurpose = purpose === "both";
  const UserAcceptedFileTypes = docsOnly
    ? DOC_TYPES
    : multiPurpose
      ? BOTH_TYPES
      : ["image/*"];

  const handleUpdateFiles = useCallback(
    (fileItems: FilePondFile[]) => {
      const maxSizeByType: Record<string, number> = {
        "application/pdf": 2.5,
        "application/msword": 2.5,
        "application/docx": 2.5,
        "application/doc": 2.5,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": 2.5,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 2.5,
        "application/vnd.ms-powerpoint": 2.5,
        "image/png": 2,
        "image/jpeg": 2,
        "image/gif": 2,
        "image/webp": 2,
      };

      const filteredItems = fileItems.filter((item) => {
        const file = item.file;
        const sizeMB = file.size / (1024 * 1024);
        const allowedSize = maxSizeByType[file.type] ?? 1;
        const label = FILE_TYPE_LABELS[file.type] ?? file.type;

        const latestList = currentFileListRef.current ?? [];

        if (latestList?.includes(file.name)) {
          toast.error(`${file.name} already exists in your file list`, {
            toastId: "filename-duplicate",
          });
          return false;
        }

        if (sizeMB > allowedSize) {
          toast.error(
            `${file.name} exceeds the ${allowedSize}MB limit for ${label}s`,
            { toastId: "file-upload-error" },
          );
          return false;
        }

        return true;
      });

      onChange(filteredItems.map((item) => item.file));
    },
    [onChange],
  );

  useEffect(() => {
    // Cast just this access, not the ref itself
    const el = (
      pondRef.current as unknown as { root?: { element?: HTMLDivElement } }
    )?.root?.element;
    if (!el) return;

    el.tabIndex = 0;
    el.role = "button";
    el.setAttribute("aria-label", "File upload area");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pondRef.current?.browse();
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      onupdatefiles={handleUpdateFiles}
      server={null}
      instantUpload={false}
    />
  );
}
