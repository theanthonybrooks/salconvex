import { useRouter } from "next/navigation";

export function useSalBackNavigation(
  fallbackPath: string = "/thelist",
  orgOnly?: boolean,
) {
  const router = useRouter();

  const goBack = () => {
    const previous = sessionStorage.getItem("previousSalPage");
    if (!orgOnly) {
      if (previous && previous.includes("/thelist")) {
        router.push(previous);
      } else {
        router.push(fallbackPath);
      }
    } else {
      router.push("/dashboard/organizer/events");
    }
  };

  return goBack;
}
