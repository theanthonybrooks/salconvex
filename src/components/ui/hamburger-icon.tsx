import { cn } from "@/lib/utils"
import styled from "styled-components"

interface MenuToggleProps {
  className?: string
  menuState: string
  setState: React.Dispatch<React.SetStateAction<string>>
}

const MenuToggle = ({ className, menuState, setState }: MenuToggleProps) => {
  return (
    <StyledWrapper>
      <button
        className={cn(
          `hamburger ${menuState === "open" ? "active" : ""}`,
          className
        )}
        onClick={() => setState(menuState === "open" ? "closed" : "open")}
        aria-label='Toggle menu'>
        <svg viewBox='0 0 32 32'>
          <path
            className='line line-top-bottom'
            d='M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22'
          />
          <path className='line' d='M7 16 27 16' />
        </svg>
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .hamburger {
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .hamburger svg {
    @media (max-width: 768px) {
      height: 3em;
    }
    height: 2.5em;
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line {
    fill: none;
    stroke: black;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line-top-bottom {
    stroke-dasharray: 12 63;
  }

  .hamburger.active svg {
    transform: rotate(-45deg);
  }

  .hamburger.active .line-top-bottom {
    stroke-dasharray: 20 300;
    stroke-dashoffset: -32.42;
  }
`

export default MenuToggle
