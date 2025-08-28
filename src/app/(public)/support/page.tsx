import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SupportPage = () => {
  return (
    <div className="mt-8 flex h-full w-full flex-col items-center justify-center">
      <h1 className="font-tanker text-[4rem] lowercase tracking-wide">
        Contact & Support
      </h1>
      <div className="mt-8 flex h-full w-full grid-cols-2 flex-col items-start gap-x-2 px-6 md:grid md:px-8">
        <section className={cn("flex flex-col items-center")}>
          <p className="text-center text-lg text-foreground">
            Having issues with the site?
          </p>
          <p className="text-balance text-center text-lg text-foreground">
            Reach out with some details of what&apos;s going on and I&apos;ll
            get back to you as soon as I can.
          </p>
          <form className="mt-4 flex flex-col gap-4">
            <Label htmlFor="email">Email</Label>
            <Input
              placeholder="Email"
              id="email"
              className="w-full max-w-xs border-foreground bg-card"
            />
            <Textarea
              id="message"
              placeholder="Message"
              className="w-full max-w-xs border-foreground bg-card"
            />
            <Button variant="salWithShadow" className="w-full">
              Send Message
            </Button>
          </form>
        </section>
        <p className="text-center text-lg text-foreground">Coming soon!</p>
      </div>
    </div>
  );
};

export default SupportPage;
