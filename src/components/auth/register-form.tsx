"use client"

import CardWrapper from "@/components/auth/card-wrapper"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { MultiSelect } from "@/components/multi-select"
import { useAuthActions } from "@convex-dev/auth/react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignInFlow } from "@/features/auth/types"
import { RegisterSchema } from "@/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

interface RegisterFormProps {
  setState: (state: SignInFlow) => void
}

type StepType = "signUp" | "verifyOtp"

const RegisterForm: React.FC<RegisterFormProps> = ({
  setState,
}: RegisterFormProps) => {
  const router = useRouter()
  const userId = uuidv4()
  const { signIn } = useAuthActions()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string[]>(["artist"])
  const [submitData, setSubmitData] = useState<object>({})
  const [step, setStep] = useState<StepType>("signUp")
  const [email, setEmail] = useState<string>("")
  const [otp, setOtp] = useState<string>("")

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      organizationName: "",
      name: "",
      source: "",
      accountType: [],
    },
  })

  const handleStep1Submit = async (values: z.infer<typeof RegisterSchema>) => {
    setError("")
    setSuccess("")

    const formData = {
      ...values,
      accountType: selectedOption,
      userId: userId,
      flow: "signUp",
    }

    setSubmitData(formData)
    setEmail(values.email)

    // try {
    //   await signIn("resend-otp", { email: formData.email }).then(() => {
    //     setStep("verifyOtp")
    //   })
    //   // User is now signed in and verified
    //   // Redirect or update UI as needed
    // } catch (error) {
    //   console.error("Verification failed:", error)
    // }
    startTransition(() => {
      // signIn("resend-otp", {
      // email: formData.email,
      // ...formData,
      // flow: "email-verification",
      // flow: "signUp",
      // redirectTo: "/verify-otp",
      signIn("password", {
        ...formData,
        flow: "signUp",
      })
        .then(() => {
          // router.push("/verify-otp")
          setSuccess("OTP sent to your email!")
          setStep("verifyOtp")
        })
        .catch((err) => {
          console.error(err)
          setError("Something went wrong. Please try again.")
        })
    })
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.")
      return
    }

    try {
      console.log("otp", otp)
      console.log("email", email)
      const result = await signIn("password", {
        email,
        code: otp,
        flow: "email-verification",
      })

      if (result) {
        console.log("result", result)
        setSuccess("Successfully signed up and verified!")
        form.reset()
      }
    } catch (error) {
      console.error(error)
      setError("Invalid OTP or verification failed. Please try again.")
    }

    // void signIn("password", {
    //   email,
    //   code: otp,
    //   flow: "email-verification",
    // })
  }

  const options: { value: "artist" | "organizer"; label: string }[] = [
    { value: "artist", label: "Artist" },
    { value: "organizer", label: "Organizer" },
  ]

  useEffect(() => {
    // Update the RHF field with the current selected values
    form.setValue("accountType", selectedOption) // ✅ No need for `.map()`
  }, [selectedOption, form])

  return (
    <CardWrapper
      className='px-4'
      headerLabel='Create an account'
      backButtonQuestion='Already have an account?'
      backButtonLabel='Sign In'
      // backButtonHref='/login'
      backButtonAction={() => setState("signIn")}>
      {step === "signUp" ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleStep1Submit)}
            className='space-y-6 '>
            <div className='space-y-4'>
              <div className='flex w-full space-y-4 flex-col md:flex-row md:space-y-0 gap-x-4 '>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder='Given name(s)'
                          inputHeight='sm'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder='Family/Surname(s)'
                          inputHeight='sm'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        {...field}
                        placeholder='email@example.com'
                        type='email'
                        inputHeight='sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex justify-between items-center '>
                      <FormLabel>Password</FormLabel>
                      <Link
                        href='/forgot-password'
                        className='font-base text-sm hover:underline '>
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder={!showPassword ? "********" : "Password!"}
                          type={showPassword ? "text" : "password"}
                          inputHeight='sm'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword((prev) => !prev)}
                          className='absolute inset-y-0 right-0 flex items-center pr-3'>
                          {showPassword ? (
                            <Eye className='size-4 text-black' />
                          ) : (
                            <EyeOff className='size-4 text-black' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='w-full flex flex-col gap-y-3'>
                <Label className=''>Account Type</Label>
                {/* <Select
                instanceId='accountTypeSelect'
                isMulti={true}
                value={selectedOption} // ✅ Explicitly control value
                options={options}
                onChange={handleChange}
                classNamePrefix='react-select'
                noOptionsMessage={() => "Out of options!"}
              /> */}
                <MultiSelect
                  options={options}
                  onValueChange={(value) => setSelectedOption(value)}
                  defaultValue={["artist"]}
                  // lockedValue={["artist"]}
                  placeholder='Select account type (select all that apply)'
                  variant='basic'
                  maxCount={3}
                  height={8}
                  hasSearch={false}
                  selectAll={false}
                />
              </div>
              {selectedOption.includes("artist") && (
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred/Artist Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder='(optional)'
                          inputHeight='sm'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedOption.includes("organizer") && (
                <FormField
                  control={form.control}
                  name='organizationName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          placeholder='(required)'
                          inputHeight='sm'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='source'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where did you hear about us?</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        {...field}
                        placeholder='IG, Google, Friends, etc? '
                        inputHeight='sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormSuccess message={success} />
            <FormError message={error} />
            <Button
              disabled={isPending}
              type='submit'
              className='mt-4 w-full py-4 border-2 border-black bg-white text-md text-black shadow-[-5px_5px_black] hover:shadow-[-3px_3px_black] hover:bg-stone-100 rounded-md active:shadow-[-1px_1px_black]'>
              Sign Up
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form onSubmit={handleOtpSubmit} className='space-y-6'>
            <FormLabel>Enter the OTP sent to {email}</FormLabel>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder='6-digit code'
              maxLength={6}
              required
              name='otp'
            />
            <FormSuccess message={success} />
            <FormError message={error} />
            <Button
              disabled={isPending}
              type='submit'
              className='w-full text-white'>
              Verify OTP
            </Button>
          </form>
        </Form>
      )}
    </CardWrapper>
  )
}

export default RegisterForm
