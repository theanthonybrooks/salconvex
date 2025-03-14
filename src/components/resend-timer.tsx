import React, { useCallback, useEffect, useRef, useState } from "react"

const ResendTimer: React.FC<{ initialTime?: number; onResend: () => void }> = ({
  initialTime = 60,
  onResend,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(() => {
    setTimeLeft(initialTime)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [initialTime])

  useEffect(() => {
    startTimer()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [initialTime, startTimer])

  const handleResend = useCallback(() => {
    onResend()
    startTimer()
  }, [onResend, startTimer])

  return (
    <div className='mt-4 text-center'>
      {timeLeft > 0 ? (
        <p className='text-sm'>
          Don&apos;t see the email? Resend in{" "}
          <span className='font-medium'>{timeLeft}</span> second
          {timeLeft !== 1 && "s"}
        </p>
      ) : (
        <span
          onClick={handleResend}
          className='font-medium text-zinc-950 decoration-foreground underline-offset-4 outline-hidden hover:underline focus:underline focus:decoration-foreground focus:decoration-2 focus:outline-hidden focus-visible:underline cursor-pointer'>
          Resend code
        </span>
      )}
    </div>
  )
}

export default ResendTimer
