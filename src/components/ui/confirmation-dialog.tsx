import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ConfirmDialog = ({
  label,
  description,
  onConfirm,
  onCancel,
  // children,
}: {
  label: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) => (
  <AlertDialog open onOpenChange={onCancel}>
    {/* {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>} */}
    <AlertDialogContent overlayClassName="bg-foreground/20">
      <AlertDialogHeader>
        <AlertDialogTitle>{label}</AlertDialogTitle>
        {description && (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        )}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
