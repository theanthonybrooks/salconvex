"use client"

import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { MultiSelect } from "@/components/multi-select"
import { useAuthActions } from "@convex-dev/auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
import CloseBtn from "@/features/auth/components/close-btn"
import { RegisterSchema } from "@/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConvex, useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import { api } from "../../../../convex/_generated/api"

interface RegisterFormProps {
  // setState: (state: SignInFlow) => void
  switchFlow: () => void
}

type StepType = "signUp" | "verifyOtp"

const RegisterForm: React.FC<RegisterFormProps> = ({
  switchFlow,
}: RegisterFormProps) => {
  const router = useRouter()
  const userId = uuidv4()
  const convex = useConvex()
  const updateVerification = useMutation(api.users.updateUserEmailVerification)
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
    mode: "onBlur",
  })

  const handleStep1Submit = async (values: z.infer<typeof RegisterSchema>) => {
    setError("")
    setSuccess("")

    try {
      const isNewUser = await convex.query(api.users.isNewUser, {
        email: values.email,
      })
      if (!isNewUser) {
        setError("A user with that email already exists.")
        return
      }
    } catch (queryError) {
      console.error("Error checking for existing user:", queryError)
    }

    const formData = {
      ...values,
      accountType: selectedOption,
      userId: userId,
      flow: "signUp",
    }

    setSubmitData(formData)
    setEmail(values.email)
    startTransition(() => {
      signIn("password", {
        ...formData,
        flow: "signUp",
      })
        .then(() => {
          setSuccess("OTP sent to your email!")
          setStep("verifyOtp")
        })
        .catch((err) => {
          if (err && err.name === "ConvexError") {
            console.error(err.data)
            setError(err.data)
          } else if (err instanceof ConvexError) {
            console.error(err.data)
            setError(err.data)
          } else {
            console.error(err)
            setError("Something went wrong. Please try again.")
          }
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
      await updateVerification({ email })

      const result = await signIn("password", {
        email,
        code: otp,
        flow: "email-verification",
      })

      if (result) {
        setSuccess("Successfully signed up and verified!")
        form.reset()
      }
    } catch (error) {
      console.error("Error in handleOtpSubmit:", error)
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
    <Card className='md:relative w-full border-none md:border-solid md:border-2 border-black bg-salYellow md:bg-white shadow-none  p-6'>
      <CloseBtn
        title='Are you sure?'
        description='You can always start again at any time though an account is required to apply to open calls. If you already have an account, you can also sign in.'
        onAction={() => router.push("/")}
        actionTitle='Login'
        onPrimaryAction={switchFlow}
      />
      <CardHeader>
        <section className='flex flex-col items-center justify-center space-y-2.5'>
          <Image
            src='/create-account.svg'
            alt='The Street Art List'
            width={300}
            height={100}
            priority={true}
            className='ml-2'
          />
          <p className='text-sm'>
            Read more about account types{" "}
            <Link
              href='/pricing'
              className='underline font-medium text-zinc-950 decoration-black underline-offset-4 outline-none focus:underline focus:decoration-black focus:decoration-2 focus:outline-none focus-visible:underline-offset-2 hover:underline-offset-1 cursor-pointer'>
              here
            </Link>
          </p>
        </section>
      </CardHeader>
      <CardContent className='flex flex-col gap-y-2.5'>
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
                            variant='basic'
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
                            variant='basic'
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
                          variant='basic'
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
                      <FormLabel>Password</FormLabel>

                      <FormControl>
                        <div className='relative'>
                          <Input
                            disabled={isPending}
                            {...field}
                            placeholder={
                              !showPassword ? "********" : "Password!"
                            }
                            type={showPassword ? "text" : "password"}
                            inputHeight='sm'
                            variant='basic'
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
                            variant='basic'
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
                            variant='basic'
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
                          variant='basic'
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
                Create Account
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
      </CardContent>
      <CardFooter className='justify-center pb-0'>
        <p className='mt-3 text-center text-sm text-black'>
          Already have an account?{" "}
          <span
            onClick={switchFlow}
            className='font-medium text-zinc-950 decoration-black underline-offset-4 outline-none hover:underline focus:underline focus:decoration-black focus:decoration-2 focus:outline-none focus-visible:underline cursor-pointer'
            tabIndex={7}>
            Sign in
          </span>
        </p>
      </CardFooter>
    </Card>
  )
}

export default RegisterForm
