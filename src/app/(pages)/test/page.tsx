"use client";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useState } from "react";

// import { columns } from "@/features/events/components/events-data-table/columns";

export default function DemoPage() {
  // const data = useQuery(api.events.event.getAllEvents, {});
  // const events = data ?? [];
  const [content, setContent] = useState("");

  return (
    <>
      {/* <div className="mx-auto hidden max-w-7xl py-10 lg:block">
        <DataTable
          columns={columns}
          data={events}
          defaultVisibility={{ eventCategory: false }}
        />
      </div>
      <div className="mx-auto max-w-7xl py-10 lg:hidden">
        <DataTable
          columns={columns}
          data={events}
          defaultVisibility={{
            eventCategory: false,
            lastEditedAt: false,
          }}
          onRowSelect={(row) => {
            console.log(row);
          }}
        />
      </div> */}
      <RichTextEditor
        value={content}
        onChange={(value) => {
          console.log(value);
          setContent(value);
        }}
        placeholder="Short blurb about your project/event... (limit 200 characters)"
        charLimit={200}
      />
      {/* <FormLinksInput type="organization" /> */}
    </>
  );
}
