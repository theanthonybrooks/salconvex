"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

const tabs: Tab[] = [
  {
    id: "openCall",
    label: "Open Call",
    content: (
      <>
        <p>
          Productize. Optics accountable talk. Thought shower. High performance
          keywords market-facing drink from the firehose, or you better eat a
          reality sandwich before you walk back in that boardroom, but
          accountable talk knowledge process outsourcing.
        </p>
        <p>
          What&apos;s our go to market strategy? Cross functional teams enable
          out of the box brainstorming nor zeitgeist viral engagement. Deep
          dive. Organic growth quick sync, feed the algorithm.
        </p>
      </>
    ),
  },
  {
    id: "application",
    label: "My Application",
    content: (
      <>
        <p>
          I love cheese, especially the big cheese gouda. Monterey jack red
          leicester roquefort cheese and wine fromage frais smelly cheese melted
          cheese dolcelatte. Fromage smelly cheese manchego paneer cheese and
          wine danish fontina macaroni cheese red leicester.
        </p>
        <p>
          Stilton fondue queso emmental when the cheese comes out
          everybody&apos;s happy croque monsieur queso paneer. Say cheese
          pecorino swiss boursin halloumi cottage cheese taleggio boursin.
        </p>
      </>
    ),
  },
  {
    id: "event",
    label: "Event",
    content: (
      <>
        <p>
          Cupcake ipsum dolor sit amet jujubes tart. Tiramisu icing gingerbread
          halvah cake. Marzipan cake soufflé cookie brownie ice cream cupcake.
          Dragée croissant bonbon ice cream oat cake jelly cookie. Wafer candy
          dessert jelly jelly-o.
        </p>
        <p>
          Oat cake donut powder pastry wafer brownie cupcake caramels bear claw.
          Bonbon caramels oat cake cake shortbread. Cake cheesecake candy icing
          bear claw marshmallow icing jelly. Halvah biscuit pudding danish
          cookie bonbon gummies.
        </p>
      </>
    ),
  },
  {
    id: "organizer",
    label: "Organizer",
    content: (
      <>
        <p>
          Miaow then turn around and show you my bum flee in terror at cucumber
          discovered on floor. Terrorize the hundred-and-twenty-pound rottweiler
          and steal his bed, not sorry sleep on dog bed, force dog to sleep on
          floor and grab pompom in mouth and put in water dish cats are fats i
          like to pets them they like to meow back present belly, scratch hand
          when stroked.
        </p>
        <p>
          Bleghbleghvomit my furball really tie the room together love
          asdflkjaertvlkjasntvkjn (sits on keyboard) but bawl under human beds.
        </p>
      </>
    ),
  },
];

export default function FolderTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="folder-container rotate-90">
      <div className="folder">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "tab bg-yellow-100 px-2 py-2 before:bg-yellow-100 after:bg-yellow-100",
                activeTab === tab.id ? "active" : "translate-y-1",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="bg-yellow-100">
                <span className="py-2">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="content">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              id={tab.id}
              className={cn(
                "content inner bg-yellow-100",
                activeTab !== tab.id && "hidden",
              )}
            >
              <div className="p-4">{tab.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
