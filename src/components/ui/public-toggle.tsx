import { Eye, EyeOff } from "lucide-react";
import styled from "styled-components";

import { cn } from "@/helpers/utilsFns";

const PublicToggle = ({
  checked,
  onChange,
  className,
  name,
}: {
  checked: boolean;
  onChange: () => void;
  className?: string;
  name?: string;
}) => {
  return (
    <StyledWrapper>
      <div className="toggle-wrapper">
        <input
          name={name}
          className="toggle-checkbox"
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <div
          className={cn(
            "toggle-container",
            checked ? "bg-emerald-200" : "bg-red-200",
            className,
          )}
        >
          {checked ? (
            <Eye className="absolute left-2 top-1/2 size-5 -translate-y-1/2" />
          ) : (
            <EyeOff className="absolute right-2 top-1/2 size-5 -translate-y-1/2" />
          )}

          <div className="toggle-button">
            <div className="toggle-button-circles-container">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="toggle-button-circle" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default PublicToggle;

const StyledWrapper = styled.div`
  .toggle-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 0.5em;
    padding: 0.125em;
    background-image: linear-gradient(to bottom, #d5d5d5, #e8e8e8);
    box-shadow: 0 1px 1px rgb(255 255 255 / 0.6);
    /* resize for demo */
    font-size: 1.25em;
  }

  .toggle-checkbox {
    appearance: none;
    position: absolute;
    z-index: 1;
    border-radius: inherit;
    width: 100%;
    height: 100%;
    /* fix em sizing */
    font: inherit;
    opacity: 0;
    cursor: pointer;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    position: relative;
    border-radius: 0.375em;
    width: 3em;
    height: 1.5em;
    /* background-color: #e8e8e8; */
    box-shadow:
      inset 0 0 0.0625em 0.125em rgb(255 255 255 / 0.2),
      inset 0 0.0625em 0.125em rgb(0 0 0 / 0.4);
    /* transition: background-color 0.4s linear; */
  }

  /* .toggle-checkbox:checked + .toggle-container {
    background-color: #f3b519;
  } */

  .toggle-button {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0.0625em;
    border-radius: 0.3125em;
    width: 1.375em;
    height: 1.375em;
    background-color: #e8e8e8;
    box-shadow:
      inset 0 -0.0625em 0.0625em 0.125em rgb(0 0 0 / 0.1),
      inset 0 -0.125em 0.0625em rgb(0 0 0 / 0.2),
      inset 0 0.1875em 0.0625em rgb(255 255 255 / 0.3),
      0 0.125em 0.125em rgb(0 0 0 / 0.5);
    transition: left 0.4s;
  }

  .toggle-checkbox:checked + .toggle-container > .toggle-button {
    left: 1.5625em;
  }

  .toggle-button-circles-container {
    display: grid;
    grid-template-columns: repeat(3, min-content);
    gap: 0.125em;
    position: absolute;
    margin: 0 auto;
  }

  .toggle-button-circle {
    border-radius: 50%;
    width: 0.125em;
    height: 0.125em;
    background-image: radial-gradient(circle at 50% 0, #f5f5f5, #c4c4c4);
  }
`;
