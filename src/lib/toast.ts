import type { TypeOptions } from "react-toastify";

import { toast, ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  autoClose: 2000,
  pauseOnHover: false,
  hideProgressBar: true,
};

export function showToast(
  type: TypeOptions,
  message: string,
  options?: ToastOptions,
) {
  toast.dismiss();

  const mergedOptions = { ...defaultOptions, ...options };

  return toast(message, { ...mergedOptions, type });
}

export function showLoadingToast(message: string, options?: ToastOptions) {
  toast.dismiss();
  return toast.loading(message, { ...defaultOptions, ...options });
}
