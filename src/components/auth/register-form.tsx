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
import { RegisterSchema } from "@/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"

import { SignInFlow } from "@/features/auth/types"
import { z } from "zod"

interface RegisterFormProps {
  setState: (state: SignInFlow) => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  setState,
}: RegisterFormProps) => {
  const { signIn } = useAuthActions()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string[]>(["artist"])
  const [step, setStep] = useState<"signUp" | { email: string }>("signUp")
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

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("")
    setSuccess("")

    const formData = {
      ...values,
      accountType: selectedOption,
    }

    const userId = uuidv4()

    startTransition(() => {
      signIn("password", {
        ...formData,
        userId: userId,
        tokenIdentifier: userId,
        flow: "signUp",
      })
        .then((data) => {
          if (!data) {
            // If there's an error, do not reset the form
            setError("Something went wrong.")
            return
          }

          // If no error, proceed with success and reset form
          setSuccess("Successfully signed up!")
          form.reset()

          setTimeout(() => {
            setError("")
            setSuccess("")
          }, 2000)
        })
        .catch((err) => {
          console.log("err", err)
          setError("Something went wrong. Check if you already have an account")
        })
    })
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            onSubmit,
            (errors) => console.log("Validation Errors:", errors) // ✅ Log validation issues
          )}
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
    </CardWrapper>
  )
}

export default RegisterForm
