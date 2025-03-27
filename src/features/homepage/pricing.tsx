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
import { useAction, useConvexAuth } from "convex/react"

import DiscreteSlider from "@/components/ui/slider"
import { User } from "@/types/user"
import { useQuery } from "convex-helpers/react/cache"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { api } from "~/convex/_generated/api"

type PricingSwitchProps = {
  onSwitch: (value: string) => void
}

type PricingCardProps = {
  user?: User
  isYearly?: boolean
  title: string
  planKey: string
  accountType: string

  prices: {
    month?: { usd?: { amount: number } }
    year?: { usd?: { amount: number } }
    rate?: number
  }

  description: string
  features?: string[]
  popular?: boolean
}

const pricingRange = [
  { value: 1, label: "Up to $5,000" },
  { value: 33, label: "$10,000" },
  { value: 66, label: "$20,000" },
  { value: 100, label: "$25,000+" },
]

const pricingIntervals = [
  { name: "Monthly", val: "0" },
  { name: "Yearly", val: "1" },
]

//--------------------- Existing Subscription  ----------------------//

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

//--------------------- Pricing Header  ----------------------//

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <div className='my-6 text-center flex flex-col items-center gap-4 '>
    <h2 className=' text-3xl font-bold text-foreground md:text-4xl'>{title}</h2>
    <p className='max-w-2xl text-gray-600 dark:text-gray-300 text-balance'>
      {subtitle}
    </p>
  </div>
)

//------------------- Pricing Switch -----------------------//

export const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => {
  const [activeTab, setActiveTab] = useState("0")

  return (
    <div className='flex items-center justify-center gap-3'>
      <Tabs
        defaultValue='0'
        className='relative w-[400px]'
        onValueChange={(val) => {
          onSwitch(val)
          setActiveTab(val)
        }}>
        <TabsList className='relative w-full bg-white/60 justify-around h-12 flex rounded-xl '>
          {pricingIntervals.map((opt) => (
            <TabsTrigger
              key={opt.val}
              value={opt.val}
              className={cn(
                "relative z-10 h-10 px-4 flex items-center justify-center w-full text-sm font-medium",
                activeTab === opt.val ? "text-black" : "text-foreground/80"
              )}>
              {activeTab === opt.val && (
                <motion.div
                  layoutId='tab-bg'
                  className='absolute inset-0 bg-background shadow-sm rounded-md z-0 flex items-center justify-center border-2'
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <span className='z-10'> {opt.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

//--------------------- Pricing Card  ----------------------//

const PricingCard = ({
  user,
  isYearly,
  title,
  planKey,
  prices,
  description,
  features,
  popular,
  accountType,
}: PricingCardProps) => {
  const router = useRouter()
  const isArtist = accountType === "artist"
  const isOrganizer = accountType === "organizer"
  const isFree = prices.rate === 0
  // const [slidingPrice, setSlidingPrice] = useState(50)
  const [sliderPrice, setSliderPrice] = useState(0)
  const getCheckoutUrl = useAction(
    api.stripeSubscriptions.createStripeCheckoutSession
  )
  const hadTrial = useQuery(
    api.stripeSubscriptions.getUserHadTrial,
    user ? {} : "skip"
  )

  const hadFreeCall = useQuery(
    api.stripeSubscriptions.getOrgHadFreeCall,
    user ? {} : "skip"
  )

  const isEligibleForFree =
    (!isFree && isOrganizer && hadFreeCall === false) || !user

  const slidingPrice = useMemo(() => {
    switch (sliderPrice) {
      case 1:
        return 50
      case 33:
        return 100
      case 66:
        return 200
      case 100:
        return 250
      default:
        return 50
    }
  }, [sliderPrice])

  const handleCheckout = async (
    interval: "month" | "year",
    hadTrial: boolean
  ) => {
    try {
      const { url } = await getCheckoutUrl({
        interval,
        planKey,
        hadTrial,
        slidingPrice: slidingPrice,
        accountType,
        isEligibleForFree,
      })

      if (url) {
        window.location.href = url
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
          "relative border-2 ": popular || isFree,
        }
      )}>
      {popular && (
        <div className='absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-salPink border-2 px-3 py-1 brightness-[1.15]'>
          <p className='text-sm font-medium text-foreground'>Recommended</p>
        </div>
      )}
      {isFree && (
        <div className='absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-salPink border-2 px-3 py-1 brightness-[1.15]'>
          <p className='text-sm font-medium text-foreground'>Free Listing</p>
        </div>
      )}

      <div>
        <CardHeader className='space-y-2 pb-4'>
          <CardTitle className='text-xl'>{title}</CardTitle>
          <CardDescription className={cn("text-foreground")}>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className='pb-4'>
          <div className='flex items-baseline gap-1'>
            <span className={cn("text-4xl font-bold")}>
              {!isFree ? (
                isArtist ? (
                  `$${
                    isYearly
                      ? prices.year?.usd?.amount?.toFixed(0) ?? "N/A"
                      : prices.month?.usd?.amount?.toFixed(0) ?? "N/A"
                  }`
                ) : isEligibleForFree ? (
                  <span className='flex items-center gap-1'>
                    <span className='line-through mr-1'>${slidingPrice}</span>
                    <span className='text-green-600 font-semibold'>$0</span>
                  </span>
                ) : (
                  `$${slidingPrice}`
                )
              ) : (
                "Free"
              )}
            </span>
            {/* <span className={cn("text-muted-foreground")}>
              {isOrganizer &&
                sliderPrice === 0 &&
                prices.rate !== 0 &&
                "Starting at"}
            </span> */}

            <span className={cn("text-muted-foreground")}>
              {isArtist && (isYearly ? "/year" : "/month")}
            </span>
          </div>
          {(!user || isEligibleForFree) && isOrganizer && (
            <p className='text-lg text-foreground text-green-600 mt-4'>
              First Open Call is free
            </p>
          )}
          {isOrganizer && !isFree && (
            <div className='flex flex-col gap-2 mt-3'>
              <p>Select your project budget:</p>
              <DiscreteSlider
                disabled={isEligibleForFree}
                value={sliderPrice ?? prices?.rate}
                onChange={(val) => setSliderPrice(val)}
                marks={pricingRange}
                prefix='$'
                suffix='/mo'
                labelFormatter={(val) => `$${val}`}
                labelDisplay='off'
                className='max-w-[80%] mx-auto'
              />
            </div>
          )}

          <div className='mt-6 space-y-2'>
            {features?.map((feature) => (
              <div key={feature} className='flex gap-2'>
                <CheckCircle2 className={cn("h-5 w-5 text-foreground")} />
                <p className={cn("text-muted-foreground")}>{feature}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <Button
          variant={
            popular || isFree ? "salWithShadowPink" : "salWithShadowHiddenYlw"
          }
          onClick={() => {
            if (!user) {
              router.push("/auth/register?src=newUser")
              return
            }

            if (isFree) {
              router.push("/submit?src=freecall")
              //TODO: utilize this src param when submitting a free call
              return
            }
            handleCheckout(isYearly ? "year" : "month", hadTrial ?? false)
          }}
          className={cn("w-full hover:brightness-105", {
            "bg-salPink brightness-[1.15] hover:brightness-125": popular,
          })}>
          {isArtist ? "Get" : "List"} {title}
        </Button>
      </CardFooter>
    </Card>
  )
}

//--------------------- Pricing Section  ----------------------//

export default function Pricing() {
  const [isYearly, setIsYearly] = useState<boolean>(false)
  const { isAuthenticated } = useConvexAuth()

  const userData = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  )
  const subStatus = useQuery(
    api.subscriptions.getUserSubscriptionStatus,
    isAuthenticated ? {} : "skip"
  )

  const hasSub = subStatus?.hasActiveSubscription

  const isPublic = !isAuthenticated
  const user = userData?.user
  const userAccountTypes = user?.accountType ?? []
  const multiType = userAccountTypes.length > 1
  let accountType = user?.accountType[0] ?? "artist"
  if (hasSub) {
    accountType = "organizer"
  }

  console.log("accountType: ", accountType)
  const [selectedAccountType, setSelectedAccountType] = useState(accountType)

  // const userIsArtist = userAccountTypes.includes("artist")
  const isArtist = selectedAccountType === "artist"
  const isOrganizer = selectedAccountType === "organizer"

  useEffect(() => {
    setSelectedAccountType(accountType)
  }, [accountType])

  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1)

  const plans = useQuery(api.plans.getUserPlans)
  const orgPlans = useQuery(api.plans.getOrgPlans)
  if (!plans || (!orgPlans && isOrganizer)) return <div>Loading plans...</div>

  if (hasSub && !userAccountTypes.includes("organizer")) {
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
    <section id='plans' className='price-card-cont px-4'>
      <div className='mx-auto max-w-7xl'>
        {isPublic && (
          <div className='flex flex-col gap-2 px-4 w-full items-center'>
            <p className='text-2xl font-bold'>Are you an</p>
            <div className='flex items-center gap-4 text-center'>
              <p
                onClick={() => {
                  setSelectedAccountType("artist")
                  setIsYearly(false)
                }}
                className={cn(
                  "font-tanker stroked lowercase text-white text-[4em] cursor-pointer tracking-wide",
                  isArtist && "wshadow text-salYellow"
                )}>
                Artist
              </p>
              <span className='font-bold'>OR</span>
              <span className='flex items-center'>
                <p
                  onClick={() => setSelectedAccountType("organizer")}
                  className={cn(
                    "font-tanker stroked lowercase text-white text-[4em] cursor-pointer tracking-wide",
                    isOrganizer && "wshadow text-salYellow"
                  )}>
                  Organizer
                </p>
                <p
                  className={cn(
                    "font-tanker stroked lowercase text-white text-[4em] cursor-pointer tracking-wide"
                  )}>
                  ?
                </p>
              </span>
            </div>
          </div>
        )}
        {isArtist && !hasSub ? (
          <PricingHeader
            title='Choose Your Plan'
            subtitle='Select the perfect plan for your needs. All plans include a 14-day free trial.'
          />
        ) : (
          <PricingHeader
            title='Select your call type'
            subtitle='Graffiti jams are always free to list and mural projects are priced on a sliding scale. All event-only listings (without open call) are free.'
          />
        )}

        {isArtist && !hasSub && (
          <PricingSwitch onSwitch={togglePricingPeriod} />
        )}
        {isArtist && !hasSub ? (
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
                    user={user}
                    planKey={key}
                    {...rest}
                    isYearly={isYearly}
                    accountType={selectedAccountType}
                  />
                )
              })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className='mt-10 flex justify-center gap-3'>
            {orgPlans &&
              orgPlans.map((plan) => {
                const { key, prices, ...rest } = plan

                const normalizedPrices = {
                  month: undefined,
                  year: undefined,
                  rate: prices?.rate ?? 0,
                }
                return (
                  <PricingCard
                    key={plan.title}
                    user={user}
                    planKey={key}
                    {...rest}
                    accountType={selectedAccountType}
                    prices={normalizedPrices}
                  />
                )
              })}
          </motion.div>
        )}
        {/* {isOrganizer && (
          <div className='flex flex-col gap-2 text-sm max-w-[60%] mx-auto text-pretty mt-6'>
            <p className='font-bold'>NOTE:</p>
            <p className='w-fit'>
              If you&apos;re unable to pay a listing fee due to financial
              reasons, you can submit your project as a free open call. We
              understand that budgets can be tight and though this site takes a
              lot of work to build/maintain, we do understand that it&apos;s not
              always possible to pay. All submissions are reviewed and subject
              to approval prior to listing.
            </p>
          </div>
        )} */}
        {/* //TODO:Add functionality that will allow artists/organizers to add other account type (prompt them) */}
        {(isPublic || multiType) && !hasSub && (
          <div className='flex flex-col gap-4 items-center justify-center mt-14 text-center'>
            {isArtist ? (
              <p>
                Want to <span className='font-bold'>add</span> an open call?
              </p>
            ) : (
              <p>
                Want to <span className='font-bold'>apply</span> to open calls?
              </p>
            )}
            <Button
              variant='salWithShadowHidden'
              size='lg'
              onClick={() => {
                setSelectedAccountType(
                  selectedAccountType === "artist" ? "organizer" : "artist"
                )
                setIsYearly(false)
              }}
              className='w-fit '>
              {selectedAccountType === "artist"
                ? "Switch to Organizer Options"
                : "Switch to Artist Options"}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
