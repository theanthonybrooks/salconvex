import SocialsRow from "@/components/ui/socials";
import Image from "next/image";
import Link from "next/link";

const SalHeader = () => {
  return (
    <div className="mb-6 flex w-full flex-col items-center justify-center gap-2">
      <Image
        src="/saltext.png"
        alt="The Street Art List"
        width={250}
        height={100}
        priority={true}
      />
      <p className="mb-4 mt-2 text-center text-sm">
        List of street art, graffiti, & mural projects.
        <br /> Info gathered and shared by{" "}
        <Link
          href="https://instagram.com/anthonybrooksart"
          target="_blank"
          className="font-semibold"
        >
          @anthonybrooksart
        </Link>
      </p>
      <SocialsRow className="mb-6 size-8 md:size-7" />
    </div>
  );
};

export default SalHeader;
