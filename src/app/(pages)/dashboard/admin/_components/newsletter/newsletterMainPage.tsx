import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useAction, usePreloadedQuery } from "convex/react";

export const NewsletterMainPage = () => {
  const sendEmails = useAction(api.actions.newsletter.sendNewsletter);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user } = userData || {};
  //   const { ip, location } = useUserInfo();

  const [pending, setPending] = useState(false);
  const handleClick = async () => {
    if (!user) throw new Error("User not found");
    // const firstName = user.firstName;
    // const date = Date.now();
    setPending(true);
    try {
      await sendEmails({
        type: "general",
        frequency: "monthly",
        plan: 2,
      });
    } catch (err) {
      console.error("Failed to send email:", err);
      showToast("error", "Failed to send email");
    } finally {
      setPending(false);
    }
  };
  return (
    <div>
      <Button onClick={handleClick}>
        {pending ? "Sending..." : "Send Email"}
      </Button>
    </div>
  );
};
