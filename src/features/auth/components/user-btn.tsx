"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Loader, LogOut } from "lucide-react";

export const UserBtn = () => {
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data) {
    return null;
  }

  const { image, firstName, lastName, email } = data;
  // console.log(data)

  const avatarFallback =
    firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-hidden relative">
        <Avatar className="size=10 transition hover:opacity-75">
          <AvatarImage src={image} alt={firstName + " " + lastName} />

          {!image && (
            <AvatarFallback className="bg-sky-500 text-white">
              {avatarFallback}
            </AvatarFallback>
          )}
        </Avatar>
        <h1>Welcome back, {firstName}</h1>
        <p className="text-xs">{email}</p>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60">
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex h-10 cursor-pointer items-center"
        >
          <LogOut className="mr-2 size-4 text-muted-foreground" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
