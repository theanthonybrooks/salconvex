import { FormSuccess } from "@/components/form-success"
import { Form } from "@/components/ui/form"
import { ForgotPasswordSchema, ResetPasswordSchema } from "@/schemas/auth"
import { useAuthActions } from "@convex-dev/auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { api } from "../../../../convex/_generated/api"

interface ForgotPasswordProps {
  switchFlow: () => void
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ switchFlow }) => {
  const router = useRouter()
  const updatePassword = useMutation(api.users.updatePassword)
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<string>("forgot")
  const [email, setEmail] = useState<string>("")
  const [success, setSuccess] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const forgotForm = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const resetForm = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { code: "", newPassword: "" },
  })

  console.log("reset form valid?", resetForm.formState)
  console.log("reset form values?", resetForm.getFieldState("code"))
  console.log("reset form values?", resetForm.getFieldState("newPassword"))

  const handleForgotSubmit = async (
    data: z.infer<typeof ForgotPasswordSchema>
  ) => {
    setError(undefined)
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("flow", "reset")
      await signIn("password", formData)
      setStep("reset")
      setEmail(data.email)
      setSuccess("Code sent!")
      forgotForm.reset()
    } catch (err) {
      setError("Failed to send code. Please try again.")
    }
  }

  const handleResetSubmit = async (
    data: z.infer<typeof ResetPasswordSchema>
  ) => {
    setError(undefined)
    try {
      const formData = {
        ...data,
        flow: "reset-verification",
        email: email,
      }
      await signIn("password", formData)
      await updatePassword({
        email,
        password: data.newPassword,
        method: "forgot",
      })
      setSuccess("Password reset!")
      resetForm.reset()
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    }
  }

  return step === "forgot" ? (
    <Form {...forgotForm}>
      <form
        onSubmit={forgotForm.handleSubmit(handleForgotSubmit)}
        className='space-y-6 flex flex-col'>
        <input
          {...forgotForm.register("email")}
          placeholder='Email'
          type='text'
        />
        {error && <div className='error'>{error}</div>}
        <button type='submit'>Send code</button>
      </form>
    </Form>
  ) : (
    <Form {...resetForm}>
      <h2>Email sent to {email}</h2>
      <p>
        Please check your email for the code (it may take a few minutes and
        could be in your spam folder)
      </p>
      {success && <FormSuccess message={success} />}
      <form
        onSubmit={resetForm.handleSubmit(handleResetSubmit)}
        className='space-y-6 flex flex-col'>
        <input {...resetForm.register("code")} placeholder='Code' type='text' />
        <input
          {...resetForm.register("newPassword")}
          placeholder='New password'
          type='password'
        />
        {/* <input
          type='hidden'
          value={step.email}
          {...resetForm.register("email")}
        /> */}
        {error && <div className='error'>{error}</div>}
        <button type='submit' onClick={() => console.log("clicked")}>
          Continue
        </button>
      </form>
      <button type='button' onClick={switchFlow}>
        Cancel
      </button>
    </Form>
  )
}

export default ForgotPassword
