"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAction, useQuery } from "convex/react"
import { format } from "date-fns"

import { CreditCard } from "lucide-react"
import { api } from "../../../../../../convex/_generated/api"

export default function AccountPage() {
  const userData = useQuery(api.users.getCurrentUser, {})
  const user = userData?.user // This avoids destructuring null or undefined

  const subscription = useQuery(api.subscriptions.getUserSubscription)
  const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl)
  const currentPeriodEnd = new Date(
    subscription?.currentPeriodEnd ?? Date.now()
  )
  const canceledAt =
    subscription?.canceledAt !== undefined && subscription?.canceledAt

  const isCancelled = subscription?.status === "cancelled"

  let interval: string | undefined
  let nextInterval: string | undefined
  let nextAmount: string | undefined

  if (subscription?.intervalNext !== undefined) {
    // intervalNext exists
    nextInterval = subscription.intervalNext
  }
  if (subscription?.amountNext !== undefined) {
    // amountNext exists
    nextAmount = (subscription.amountNext! / 100).toFixed(0)
    interval = subscription.interval
  }

  const handleManageSubscription = async () => {
    try {
      const result = await getDashboardUrl({
        customerId: subscription?.customerId!,
      })
      if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Error getting dashboard URL:", error)
    }
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div>
        <h1 className='text-3xl font-semibold tracking-tight'>
          Subscription Overview
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Track your revenue, expenses, and financial metrics
        </p>
        <Button className='mt-3' onClick={handleManageSubscription}>
          Manage Subscription
        </Button>
      </div>

      {/* Account Information Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Subscription Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!subscription ? (
              <div className='space-y-4'>
                <Skeleton className='h-4 w-[180px]' />
                <Skeleton className='h-4 w-[150px]' />
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[170px]' />
              </div>
            ) : (
              <div className='grid gap-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Status:</span>
                  <span className='font-medium capitalize'>
                    {subscription?.status === "active" ? (
                      <span className='rounded bg-green-100 px-3 py-1 font-medium text-green-700'>
                        Active
                      </span>
                    ) : subscription?.status === "past_due" ? (
                      <span className='rounded bg-red-100 px-3 py-1 font-medium text-red-700'>
                        Past Due
                      </span>
                    ) : subscription?.status === "unpaid" ? (
                      <span className='rounded bg-yellow-100 px-3 py-1 font-medium text-yellow-700'>
                        Unpaid
                      </span>
                    ) : subscription?.status === "trialing" ? (
                      <span className='rounded bg-yellow-100 px-3 py-1 font-medium text-yellow-700'>
                        2 Week Free Trial
                      </span>
                    ) : (
                      <span className='rounded bg-gray-100 px-3 py-1 font-medium text-gray-700'>
                        No Plan
                      </span>
                    )}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    Account Interval:
                  </span>
                  <span className='font-medium capitalize'>
                    {subscription?.interval + "ly"}
                  </span>
                </div>

                <div className='mt-0 flex items-start justify-between'>
                  <span className='whitespace-nowrap text-muted-foreground'>
                    Plan Amount:
                  </span>
                  <span className='flex flex-col items-end justify-start font-medium'>
                    ${(subscription?.amount! / 100).toFixed(0)}
                    {nextAmount !== undefined && (
                      <>
                        <span className='text-sm font-light italic text-gray-400'>
                          {" "}
                          {/* (${(nextAmount! / 100).toFixed(0)} starting ) */}
                          (${nextAmount}/{interval} starting{" "}
                          {format(currentPeriodEnd, "MMM do yyyy")})
                        </span>
                        <span className='mt-1 text-balance text-end text-sm font-light italic text-gray-400'>
                          Can be changed before start date via the{" "}
                          <a
                            href='#'
                            className='font-normal text-gray-300'
                            onClick={handleManageSubscription}>
                            Manage Subscription
                          </a>{" "}
                          page
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Auto Renew:</span>
                  <span className='font-medium'>
                    {isCancelled
                      ? "-"
                      : subscription?.cancelAtPeriodEnd
                      ? "No"
                      : "Yes"}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Next Due Date:</span>
                  <span className='font-medium'>
                    {isCancelled
                      ? "Cancelled"
                      : format(currentPeriodEnd, "MMM do, yyyy")}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    {isCancelled ? "Account Created:" : "Subscribed Since:"}
                  </span>
                  <span className='font-medium'>
                    {format(new Date(subscription?.startedAt!), "MMM do, yyyy")}
                  </span>
                </div>
                {!canceledAt ? (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Last Updated:</span>
                    <span className='font-medium'>
                      {format(
                        new Date(subscription?.lastEditedAt!),
                        "MMM do, yyyy @ h:mm a"
                      )}
                    </span>
                  </div>
                ) : (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      Cancellation Date:
                    </span>
                    <span className='font-medium text-red-500'>
                      {format(
                        new Date(subscription?.canceledAt!),
                        "MMM do, yyyy @ h:mm a"
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
