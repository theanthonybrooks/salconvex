import SalHeader from "@/components/ui/sal-header";
import ClientEventList from "@/features/events/event-list-client";

const TheList = async () => {
  return (
    <>
      <SalHeader source="thelist" />
      <ClientEventList />
    </>
  );
};

export default TheList;
