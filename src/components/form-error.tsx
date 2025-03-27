import { FaExclamationTriangle } from "react-icons/fa"

interface FormErrorProps {
  message?: string
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null
  return (
    <div className='bg-destructive/15 p-3 rounded-md items-center flex gap-x-2 text-sm text-destructive justify-center'>
      <FaExclamationTriangle className='size-8 shrink-0 pl-3' />
      <span className='text-center'> {message}</span>
    </div>
  )
}
