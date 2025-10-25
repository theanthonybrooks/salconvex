import { EligibilityLabelBaseProps } from "@/features/events/open-calls/components/eligibility-label-client";
import { getDemonym } from "@/helpers/locationFns";

export const EligibilityLabelServer = ({
  type,
  whom,
  hasDetails,
}: EligibilityLabelBaseProps) => {
  const internationalType = type === "International";
  const nationalType = type === "National";
  const unknownType = type === "Unknown";

  if (!type || !whom) return null;
  if (unknownType) {
    return "Not Specified";
  } else if (internationalType) {
    return (
      <p>
        International (All)
        {hasDetails && <sup>*</sup>}
      </p>
    );
  } else if (nationalType) {
    if (whom.length === 1) {
      return (
        <p>
          {getDemonym(whom[0])} Artists
          {hasDetails && <sup>*</sup>}
        </p>
      );
    } else {
      return "See Caption for more details";
    }
  } else if (type === "Regional/Local") {
    return (
      <p>
        Regional/Local<sup>*</sup>
      </p>
    );
  } else {
    return "See Caption for more details";
  }
};
