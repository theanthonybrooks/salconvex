import { useRouter } from "next/navigation";

export function useSalBackNavigation(fallbackPath: string = "/thelist") {
  const router = useRouter();

  const goBack = () => {
    const previous = sessionStorage.getItem("previousSalPage");

    if (
      previous &&
      (previous.includes("/thelist") ||
        previous.includes("/thisweek") ||
        previous.includes("/calendar") ||
        previous.includes("/map"))
    ) {
      router.push(previous);
    } else {
      router.push(fallbackPath);
    }
  };

  return goBack;
}
