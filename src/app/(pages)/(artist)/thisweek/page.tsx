// const ThisWeekPage = () => {
//   return (
//     <div className="flex h-full w-full flex-col items-center justify-center">
//       <h1 className="font-tanker text-[5rem] lowercase tracking-wide">
//         This Week
//       </h1>
//       <p className="text-center text-lg text-foreground">
//         Coming soon! (unironically)
//       </p>
//     </div>
//   );
// };

// export default ThisWeekPage;

import SalHeader from "@/components/ui/sal-header";
import ClientThisWeekList from "@/features/events/thisweek-list-client";

const ThisWeekPage = async () => {
  return (
    <>
      <SalHeader source="thisweek" />
      <ClientThisWeekList />
    </>
  );
};

export default ThisWeekPage;
