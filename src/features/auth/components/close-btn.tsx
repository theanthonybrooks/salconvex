import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPrimaryAction,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface CloseBtnProps {
  title?: string
  description: string
  onAction: () => void
  actionTitle?: string
  onPrimaryAction?: () => void | string
  primaryActionTitle?: string
  className?: string
  actionClassName?: string
}

const CloseBtn: React.FC<CloseBtnProps> = ({
  title = "Where would you like to go?",
  description,
  onAction,
  actionTitle = "Yes",
  onPrimaryAction,
  primaryActionTitle = "Return to homepage",
  actionClassName,
  className,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={cn(
            "absolute right-5 top-4 z-10 rounded text-lg font-bold text-foreground hover:rounded-full hover:text-salPink focus:bg-salPink",
            className
          )}
          aria-label='Close modal'
          // tabIndex={successfulCreation ? 6 : 4}
        >
          <X size={25} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className='w-[80dvw] bg-salYellow text-foreground'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-2xl'>{title}</AlertDialogTitle>
          <AlertDialogDescription className='text-foreground'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction} className={actionClassName}>
            {actionTitle}
          </AlertDialogAction>
          {onPrimaryAction && (
            <AlertDialogPrimaryAction onClick={onPrimaryAction}>
              {primaryActionTitle}
            </AlertDialogPrimaryAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CloseBtn
