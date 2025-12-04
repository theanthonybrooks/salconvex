"use client";

import { DOC_TYPES } from "@/constants/fileConsts";

import { useState } from "react";

import { Book, BookDashed, Download, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilePreviewer } from "@/components/ui/popover-file-preview";
import { getMimeTypeFromHref } from "@/helpers/fileFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface OpenCallFile {
  id: string;
  title: string;
  href: string;
  archived?: boolean;
}

interface Props {
  files: OpenCallFile[];
  eventId: string;
  isDraft?: boolean;
  isApproved?: boolean;
  isAdmin?: boolean;
  isMobile?: boolean;
  isPublic?: boolean;
  type?: "docs" | "images";
  className?: string;
  disabled?: boolean;
  recap?: boolean;
}

export function hasId<T extends { id?: unknown }>(
  doc: T,
): doc is T & { id: string } {
  return typeof doc.id === "string";
}

export function OpenCallFilesTable({
  files,
  eventId,
  // isDraft,
  isApproved = false,
  isAdmin = false,
  isMobile = false,
  isPublic = false,
  type,
  className,
  disabled,
  recap,
}: Props) {
  const deleteFile = useMutation(api.uploads.files.deleteFile);
  const editFileName = useMutation(api.uploads.files.editFileName);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const isDocument = type === "docs";
  const visibleFiles = isDocument
    ? files.filter((doc) => DOC_TYPES.includes(getMimeTypeFromHref(doc.title)))
    : files;

  const startEditing = (id: string, currentTitle: string) => {
    const baseName = currentTitle.replace(/\.[^/.]+$/, "");
    setEditingId(id);
    setTempTitle(baseName);
  };

  const submitTitle = async (fileId: string) => {
    const originalTitle = files.find((f) => f.id === fileId)?.title;
    if (!originalTitle) return;

    const extensionMatch = originalTitle.match(/\.[^/.]+$/);
    const extension = extensionMatch ? extensionMatch[0] : "";
    const newFullTitle = tempTitle.trim() + extension;

    if (newFullTitle !== originalTitle) {
      await editFileName({
        fileId: fileId as Id<"openCallFiles">,
        eventId: eventId as Id<"events">,
        newTitle: newFullTitle,
      });
    }

    setEditingId(null);
  };

  const mobileHidden = "hidden md:table-cell";
  const mobileEditing = isMobile && editingId !== null;
  return (
    <div className={cn("mt-2 space-y-2", className)}>
      {!isPublic && (
        <span className="flex items-center gap-2">
          {!recap && (
            <Label className="sm underline underline-offset-2">
              Existing Files:
            </Label>
          )}
          <p className="text-xs italic text-foreground/60">
            Click on a file to edit its name
          </p>
        </span>
      )}
      <table className="w-full table-auto text-sm text-foreground/70">
        <thead>
          <tr className="border-b border-muted text-left text-xs">
            <th className="w-8 px-2 py-1">#</th>
            <th className="px-2 py-1">Document</th>
            {!mobileEditing && (
              <th className={cn("w-10 px-2 py-1 text-center")}>
                {!isMobile && "Preview"}
              </th>
            )}
            {isApproved && !mobileEditing && !isPublic && (
              <th className={cn("w-12 px-2 py-1 text-center", mobileHidden)}>
                Archive
              </th>
            )}
            {!mobileEditing &&
              !isPublic &&
              !disabled &&
              (!isApproved || isAdmin) && (
                <th className={cn("w-10 px-2 py-1 text-center")}>
                  {!isMobile && "Delete"}
                </th>
              )}
            {isPublic && (
              <th className={cn("w-10 px-2 py-1 text-center")}>
                {!isMobile && "Download"}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleFiles
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((doc, i) => {
              const maxLength = 25;
              const formattedTitle =
                doc.title.slice(0, 25) + "..." + doc.title.slice(-5);
              const displayTitle =
                doc.title.length > maxLength ? formattedTitle : doc.title;

              return (
                <tr
                  key={doc.id}
                  className="group border-b border-muted transition-all hover:bg-accent/20"
                >
                  <td className="px-2 py-2">{i + 1}</td>
                  <td
                    className={cn(
                      "max-w-30 px-2 py-2 sm:max-w-none",
                      editingId === doc.id && "max-w-auto",
                    )}
                  >
                    {isPublic ? (
                      <FilePreviewer
                        title={doc.title}
                        href={doc.href}
                        type={getMimeTypeFromHref(doc.title)}
                        isPublic={isPublic}
                        icon={false}
                      >
                        {doc.title}
                      </FilePreviewer>
                    ) : editingId === doc.id ? (
                      <Input
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={() => submitTitle(doc.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitTitle(doc.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="text-base sm:text-sm"
                      />
                    ) : (
                      <button
                        className={cn(
                          "w-full truncate text-left hover:underline",
                          doc.archived && "line-through",
                        )}
                        onClick={() => {
                          if (isPublic) return;
                          startEditing(doc.id, doc.title);
                        }}
                      >
                        {displayTitle}
                      </button>
                    )}
                  </td>
                  {!mobileEditing && (
                    <td className={cn("px-2 py-2 text-center")}>
                      <FilePreviewer
                        title={doc.title}
                        href={doc.href}
                        type={getMimeTypeFromHref(doc.title)}
                        isPublic={isPublic}
                      />
                    </td>
                  )}
                  {isApproved && !isMobile && !isPublic && (
                    <td
                      className="px-2 py-2 text-center"
                      onClick={() => {
                        deleteFile({
                          fileId: doc.id as Id<"openCallFiles">,
                          eventId: eventId as Id<"events">,
                          archive: doc?.archived ?? false,
                        });
                      }}
                    >
                      <div className="cursor-pointer text-amber-800 opacity-70 transition hover:scale-110">
                        {!doc?.archived && isApproved && (
                          <Book className={cn("mx-auto size-4")} />
                        )}
                        {doc?.archived && (
                          <BookDashed className="mx-auto size-4" />
                        )}
                      </div>
                    </td>
                  )}
                  {!mobileEditing &&
                    !isPublic &&
                    !disabled &&
                    (!isApproved || isAdmin) && (
                      <td className="px-2 py-2 text-center">
                        <X
                          className={cn(
                            "mx-auto size-4 cursor-pointer text-red-600 opacity-70 transition hover:scale-110 hover:opacity-100",
                          )}
                          onClick={() =>
                            deleteFile({
                              fileId: doc.id as Id<"openCallFiles">,
                              eventId: eventId as Id<"events">,
                            })
                          }
                        />
                      </td>
                    )}
                  {isPublic && (
                    <td className="px-2 py-2 text-center">
                      <a
                        href={doc.href}
                        download={doc.title}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download
                          className={cn(
                            "mx-auto size-4 cursor-pointer hover:scale-110 active:scale-95",
                          )}
                        />
                      </a>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
