"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useAction } from "convex/react"

import { useQuery } from "convex-helpers/react/cache"
import { motion } from "framer-motion"
import { CheckCircle2, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { api } from "~/convex/_generated/api"

type PricingSwitchProps = {
  onSwitch: (value: string) => void
}

type PricingCardProps = {
  userExists: boolean
  isYearly?: boolean
  title: string
  planKey: string
  prices: {
    month?: { usd?: { amount: number } }
    year?: { usd?: { amount: number } }
  }

  description: string
  features?: string[]
  popular?: boolean
  exclusive?: boolean
}

const ExistingSubscription = () => {
  return (
    <Card className='flex w-full max-w-sm flex-col justify-between px-2 py-1'>
      <Link href='/dashboard/account'>
        <Button className={"w-full bg-white text-gray-900 hover:bg-gray-100"}>
          Manage Subscription
        </Button>
      </Link>
    </Card>
  )
}

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <div className='mb-10 text-center'>
    {/* Pill badge */}
    <div className='mx-auto mb-6 w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-1 dark:border-blue-900 dark:bg-blue-900/30'>
      <div className='flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200'>
        <DollarSign className='h-4 w-4' />
        <span>Pricing</span>
      </div>
    </div>

    <h2 className='bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text pb-2 text-3xl font-bold text-transparent dark:from-white dark:via-blue-300 dark:to-white md:text-4xl'>
      {title}
    </h2>
    <p className='mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300'>
      {subtitle}
    </p>
  </div>
)

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <div className='flex items-center justify-center gap-3'>
    <Tabs defaultValue='0' className='w-[400px]' onValueChange={onSwitch}>
      <TabsList className='w-full'>
        <TabsTrigger value='0' className='w-full'>
          Monthly
        </TabsTrigger>
        <TabsTrigger value='1' className='w-full'>
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
)

const PricingCard = ({
  userExists,
  isYearly,
  title,
  planKey,
  prices,
  description,
  features,
  popular,
  exclusive,
}: PricingCardProps) => {
  const router = useRouter()

  const getCheckoutUrl = useAction(
    api.stripeSubscriptions.createStripeCheckoutSession
  )
  // const subscriptionStatus = useQuery(
  //   api.subscriptions.getUserSubscriptionStatus
  // )

  const hadTrial = useQuery(api.stripeSubscriptions.getUserHadTrial)

  // const hasSubscription = useQuery(
  //   api.stripeSubscriptions.getUserHasSubscription
  // )

  // console.log("hasSubscription: ", hasSubscription)

  const handleCheckout = async (
    interval: "month" | "year",
    hadTrial: boolean
  ) => {
    try {
      const { url } = await getCheckoutUrl({
        interval,
        planKey,
        hadTrial,
      })

      if (url) {
        window.location.href = url
        // console.log("Checkout URL:", url)
      }
    } catch (error) {
      console.error("Failed to get checkout URL:", error)
    }
  }

  return (
    <Card
      className={cn(
        "flex w-full min-w-[20vw] max-w-sm flex-col justify-between px-2 py-1",
        {
          "relative border-2 border-blue-500 dark:border-blue-400": popular,
          "bg-linear-to-b from-gray-900 to-gray-800 text-white shadow-2xl":
            exclusive,
        }
      )}>
      {popular && (
        <div className='absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-blue-500 px-3 py-1 dark:bg-blue-400'>
          <p className='text-sm font-medium text-white'>Most Popular</p>
        </div>
      )}

      <div>
        <CardHeader className='space-y-2 pb-4'>
          <CardTitle className='text-xl'>{title}</CardTitle>
          <CardDescription
            className={cn("", {
              "text-gray-300": exclusive,
            })}>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className='pb-4'>
          <div className='flex items-baseline gap-1'>
            <span
              className={cn("text-4xl font-bold", {
                "text-white": exclusive,
              })}>
              $
              {isYearly
                ? prices.year?.usd?.amount?.toFixed(0) ?? "N/A"
                : prices.month?.usd?.amount?.toFixed(0) ?? "N/A"}
            </span>
            <span
              className={cn("text-muted-foreground", {
                "text-gray-300": exclusive,
              })}>
              {isYearly ? "/year" : "/month"}
            </span>
          </div>

          <div className='mt-6 space-y-2'>
            {features?.map((feature) => (
              <div key={feature} className='flex gap-2'>
                <CheckCircle2
                  className={cn("h-5 w-5 text-blue-500", {
                    "text-blue-400": exclusive,
                  })}
                />
                <p
                  className={cn("text-muted-foreground", {
                    "text-gray-300": exclusive,
                  })}>
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <Button
          onClick={() => {
            if (!userExists) {
              router.push("/auth/sign-in")
              return
            }
            handleCheckout(isYearly ? "year" : "month", hadTrial ?? false)
          }}
          className={cn("w-full", {
            "bg-blue-500 hover:bg-blue-400": popular,
            "bg-white text-gray-900 hover:bg-gray-100": exclusive,
          })}>
          Get {title}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Pricing() {
  const subscriptionStatus = useQuery(
    api.subscriptions.getUserSubscriptionStatus
  )
  const [isYearly, setIsYearly] = useState<boolean>(false)
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1)
  const userData = useQuery(api.users.getCurrentUser, {})
  const user = userData?.user

  const plans = useQuery(api.plans.getUserPlans)
  if (!plans) return <div>Loading plans...</div>

  if (subscriptionStatus?.hasActiveSubscription) {
    return (
      <div className='mt-[1rem] flex w-full flex-col items-center justify-center p-3'>
        <PricingHeader
          title='Your Subscription'
          subtitle='Want to upgrade or cancel your subscription?'
        />
        <ExistingSubscription />
      </div>
    )
  }

  return (
    <section className='price-card-cont px-4'>
      <div className='mx-auto max-w-7xl'>
        <PricingHeader
          title='Choose Your Plan'
          subtitle='Select the perfect plan for your needs. All plans include a 14-day free trial.'
        />
        <PricingSwitch onSwitch={togglePricingPeriod} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='mt-10 flex justify-center gap-3'>
          {[...plans]
            .sort((a, b) => {
              const priceA = isYearly
                ? a.prices.year?.usd?.amount ?? Infinity
                : a.prices.month?.usd?.amount ?? Infinity
              const priceB = isYearly
                ? b.prices.year?.usd?.amount ?? Infinity
                : b.prices.month?.usd?.amount ?? Infinity
              return priceA - priceB
            })
            .map((plan) => {
              const { key, ...rest } = plan
              return (
                <PricingCard
                  key={plan.title}
                  userExists={!!user}
                  planKey={key}
                  {...rest}
                  isYearly={isYearly}
                />
              )
            })}
        </motion.div>
      </div>
    </section>
  )
}
