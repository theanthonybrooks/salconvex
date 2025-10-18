import { debounce } from "lodash";

export const createDebouncedHandler = (
  callback: (value: string) => void,
  delay = 500,
) => {
  return debounce(callback, delay);
};
