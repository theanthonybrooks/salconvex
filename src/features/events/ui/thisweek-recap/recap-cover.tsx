import Image from "next/image";

interface RecapCoverProps {
  dateRange: string;
}

export const RecapCover = ({ dateRange }: RecapCoverProps) => {
  return (
    <div className="relative w-[500px] bg-[#feee1f] bg-cover bg-center">
      <section className="post-header">
        <Image
          className="-z-1 h-full w-full p-10 pl-12"
          src="/branding/weeklybgsalupdate.png"
          alt="Open Calls Ending this Week Background"
          height={400}
          width={400}
        />
      </section>
      <section className="absolute bottom-1/2 flex w-full translate-y-[12.3em] flex-col">
        <section className="filler">
          <h2 className="text-center font-tanker text-[2.8em] lowercase">
            {dateRange}
          </h2>
          <div className="translate-y-6 text-center text-lg">
            <p> See &quot;Open calls ending this week&quot;</p>{" "}
            <p>in bio for links</p>
          </div>
        </section>
      </section>
    </div>
  );
};
