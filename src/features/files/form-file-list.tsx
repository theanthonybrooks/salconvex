"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilePreviewer } from "@/components/ui/popover-file-preview";
import { getMimeTypeFromHref } from "@/lib/fileFns";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Book, X } from "lucide-react";
import { useState } from "react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface OpenCallFile {
  id: string;
  title: string;
  href: string;
  archived?: boolean;
}

interface Props {
  files: OpenCallFile[];
  eventId: string;
  isDraft: boolean;
  isAdmin: boolean;
  isMobile: boolean;
}

export function hasId<T extends { id?: unknown }>(
  doc: T,
): doc is T & { id: string } {
  return typeof doc.id === "string";
}

export function OpenCallFilesTable({
  files,
  eventId,
  isDraft,
  isAdmin,
  isMobile,
}: Props) {
  const deleteFile = useMutation(api.uploads.files.deleteFile);
  const editFileName = useMutation(api.uploads.files.editFileName);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setTempTitle(currentTitle);
  };

  const submitTitle = async (fileId: string) => {
    if (
      tempTitle.trim().length > 0 &&
      tempTitle !== files.find((f) => f.id === fileId)?.title
    ) {
      await editFileName({
        fileId: fileId as Id<"openCallFiles">,
        eventId: eventId as Id<"events">,
        newTitle: tempTitle,
      });
    }
    setEditingId(null);
  };
  const mobileHidden = "hidden md:block";
  const mobileEditing = isMobile && editingId !== null;
  return (
    <div className="mt-2 space-y-2">
      <span className="flex items-center gap-2">
        {" "}
        <Label className="sm underline underline-offset-2">
          Existing Files:
        </Label>{" "}
        <p className="text-xs italic text-foreground/60">
          Click on a file to edit its name{" "}
        </p>
      </span>
      <table className="w-full table-auto text-sm text-foreground/70">
        <thead>
          <tr className="border-b border-muted text-left">
            <th className="w-8 px-2 py-1">#</th>
            <th className="px-2 py-1">Document</th>
            {!mobileEditing && (
              <th className={cn("w-10 px-2 py-1 text-center")}>
                {!isMobile && "Preview"}
              </th>
            )}
            {!isDraft && !mobileEditing && (
              <th className={cn("w-10 px-2 py-1 text-center", mobileHidden)}>
                Archive
              </th>
            )}
            {!mobileEditing && (
              <th className={cn("w-10 px-2 py-1 text-center")}>
                {!isMobile && "Delete"}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {files
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((doc, i) => (
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
                  {editingId === doc.id ? (
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
                      onClick={() => startEditing(doc.id, doc.title)}
                    >
                      {doc.title}
                    </button>
                  )}
                </td>
                {!mobileEditing && (
                  <td className={cn("px-2 py-2 text-center")}>
                    <FilePreviewer
                      href={doc.href}
                      type={getMimeTypeFromHref(doc.title)}
                    />
                  </td>
                )}
                {!isDraft && !isMobile && (
                  <td className="px-2 py-2 text-center">
                    <Book
                      className={cn(
                        "mx-auto size-4 cursor-pointer text-amber-800 opacity-70 transition hover:scale-110 hover:opacity-100",
                        (isDraft || doc?.archived) &&
                          !isAdmin &&
                          "pointer-events-none invisible",
                      )}
                      onClick={() =>
                        deleteFile({
                          fileId: doc.id as Id<"openCallFiles">,
                          eventId: eventId as Id<"events">,
                          archive: true,
                        })
                      }
                    />
                  </td>
                )}
                {!mobileEditing && (
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
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
