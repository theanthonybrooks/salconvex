import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";

export const NavbarSigninSection = () => {
  return (
    <div className="hidden h-15 w-fit items-center justify-self-end lg:flex">
      <div className="flex items-center gap-4">
        <Link
          href="/auth/sign-in"
          prefetch={true}
          className="[&_button]:hover:underline"
        >
          <Button
            variant="link"
            className="font-bold decoration-2 hover:underline-offset-4 active:underline-offset-2 sm:text-base"
          >
            Sign in
          </Button>
        </Link>
        <Link href="/auth/register" prefetch={true}>
          <Button
            variant="salWithShadowHiddenBg"
            className="rounded-full font-bold sm:text-base"
          >
            Sign up
          </Button>
        </Link>
      </div>
    </div>
  );
};
