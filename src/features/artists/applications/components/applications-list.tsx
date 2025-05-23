"use client";

import { SubPage } from "@/app/(pages)/dashboard/artist/[slug]/[subpage]/page";
import { useQuery } from "convex-helpers/react/cache";
import Link from "next/link";
import { api } from "~/convex/_generated/api";

interface ApplicationsListProps {
  pageType: SubPage;
}

export const ApplicationsList = ({ pageType }: ApplicationsListProps) => {
  const bookmarkedEvents = useQuery(
    api.artists.listActions.getBookmarkedEventsWithDetails,
    pageType === "bookmarks" ? {} : "skip",
  );

  //   const allApplications = useQuery(
  //     api.artists.applications.getArtistApplications,
  //     pageType === "submitted" ? {} : "skip"
  //   );

  //   const data =
  //     pageType === "bookmarks"
  //       ? bookmarkedEvents
  //       : pageType === "submitted"
  //       ? allApplications
  //       : [];

  const data = bookmarkedEvents ?? [];

  const handleDeleteBookmark = (eventId: string) => {
    // Placeholder: Replace with your mutation function
    console.log("Delete bookmark:", eventId);
  };

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="mb-4 text-xl font-semibold capitalize">{pageType}</h2>

      {!data || data?.length === 0 ? (
        <p className="text-muted-foreground">No entries found.</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Event Name</th>
              <th className="border px-4 py-2 text-left">Link</th>
              {pageType === "bookmarks" && (
                <th className="border px-4 py-2 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((event) => (
              <tr key={event._id} className="border-b">
                <td className="border px-4 py-2">{event.name}</td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/thelist/events/${event.slug}/${new Date(
                      event._creationTime,
                    ).getFullYear()}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
                {pageType === "bookmarks" && (
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDeleteBookmark(event._id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
