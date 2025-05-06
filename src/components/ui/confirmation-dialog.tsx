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
}: {
  label: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <AlertDialog open onOpenChange={onCancel}>
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
