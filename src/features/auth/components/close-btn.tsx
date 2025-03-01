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
import { X } from "lucide-react"

interface CloseBtnProps {
  title?: string
  description: string
  onAction: () => void
  actionTitle?: string
  onPrimaryAction?: () => void | string
  primaryActionTitle?: string
  className?: string
}

const CloseBtn: React.FC<CloseBtnProps> = ({
  title = "Where would you like to go?",
  description,
  onAction,
  actionTitle = "Yes",
  onPrimaryAction,
  primaryActionTitle = "Return to homepage",
  className,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className='absolute right-5 top-4 z-10 rounded text-lg font-bold text-black hover:rounded-full hover:text-salPink focus:bg-salPink'
          aria-label='Close modal'
          // tabIndex={successfulCreation ? 6 : 4}
        >
          <X size={25} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className='w-[80dvw] bg-salYellow text-black'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-2xl'>{title}</AlertDialogTitle>
          <AlertDialogDescription className='text-black'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>
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
