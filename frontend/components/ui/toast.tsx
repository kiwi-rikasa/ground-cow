import { toast as sonnerToast } from "sonner";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export const toast = ({ message, type = "info" }: ToastProps) => {
  switch (type) {
    case "success":
      sonnerToast.success(message);
      break;
    case "error":
      sonnerToast.error(message);
      break;
    default:
      sonnerToast(message);
  }
};
