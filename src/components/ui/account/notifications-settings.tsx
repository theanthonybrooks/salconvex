import {
  newsletterFrequencyOptions,
  newsletterTypeOptions,
} from "@/constants/newsletterConsts";

import type {
  NewsletterFrequency,
  NewsletterType,
} from "@/constants/newsletterConsts";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

import { FaMobileAlt } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import {
  Bell,
  Calendar,
  Clock,
  Globe,
  HelpCircle,
  ListTodo,
  LoaderCircle,
  Mail,
  MailSearch,
  Megaphone,
  Monitor,
  Newspaper,
  PiggyBank,
  ScrollText,
  Shield,
  Table,
  UserMinus,
  UserPlus,
  Users2,
} from "lucide-react";

import type {
  InAppNotificationsType,
  NewsletterStatusType,
} from "~/convex/schema";
import { MultiSelect } from "@/components/multi-select";
import {
  SectionGroup,
  SectionItem,
} from "@/components/ui/account/section-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn, hasAnyTrueValue } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import {
  useAction,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { ConvexError } from "convex/values";

export const NotificationsSettings = () => {
  const isMobile = useIsMobile();
  const [pending, setPending] = useState(false);
  void pending;
  const [verificationPendingSend, setVerificationPendingSend] =
    useState<boolean>(false);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const requestVerificationEmail = useMutation(
    api.newsletter.subscriber.requestVerificationEmail,
  );
  const subscribeToNewsletter = useMutation(
    api.newsletter.subscriber.subscribeToNewsletter,
  );
  const unsubscribeFromNewsletter = useAction(
    api.actions.newsletter.sendNewsletterUpdateConfirmation,
  );
  const updateUserNotifications = useMutation(
    api.users.updateUserNotifications,
  );
  const updateUserinAppNotification = useMutation(
    api.users.updateUserInAppNotifications,
  );
  const updateNewsletterSubscription = useMutation(
    api.newsletter.subscriber.updateNewsletterStatus,
  );
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};
  const userPlan = subData?.subPlan ?? 0;
  const minBananaUser = hasActiveSubscription && userPlan >= 2;
  const { user, userPref, userId } = userData ?? {};
  const isAdmin =
    user?.role?.includes("admin") || user?.role?.includes("creator");
  const isUser = user?.role?.includes("user");
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  const rawInAppNotifications = userPref?.notifications?.inAppNotifications;

  const inAppNotifications =
    typeof rawInAppNotifications === "object" && rawInAppNotifications !== null
      ? rawInAppNotifications
      : {};

  const newsletterData = useQuery(
    api.newsletter.subscriber.getNewsletterStatus,
    userId
      ? {
          userId,
        }
      : "skip",
  );
  const validNewsletterStatuses = ["active", "pending"];

  const signedUpForNewsletter =
    validNewsletterStatuses.includes(
      newsletterData?.newsletter ?? "inactive",
    ) && newsletterData?.verified !== false;

  const handleUpdateinAppNotifications = async (
    value: InAppNotificationsType,
  ) => {
    setPending(true);

    if (!user || !user.email) {
      throw new Error("No user found");
    }
    try {
      await updateUserinAppNotification({ inAppNotifications: value });
    } catch (error) {
      console.error("Failed to update push notifications:", error);
      showToast("error", "Failed to update push notifications");
    } finally {
      setPending(false);
    }
  };

  const handleUpdateNotifications = async (
    type: "newsletter" | "general" | "applications",
    value: boolean,
  ) => {
    setPending(true);

    if (!user || !user.email) {
      throw new Error("No user found");
    }
    try {
      const { inAppNotifications, ...rest } = userPref?.notifications ?? {};
      void inAppNotifications;
      const updated = {
        ...rest,
        [type]: value,
      };

      if (type === "newsletter") {
        if (value) {
          await subscribeToNewsletter({
            email: user.email,
            firstName: user.firstName,
          });
          showToast(
            "success",
            "Nearly done! Please check your junk mail folder for the verification email.",
          );
        } else {
          await unsubscribeFromNewsletter({
            newsletter: "inactive",
            email: user.email,
          });
          showToast(
            "success",
            "Successfully updated notification preferences!",
          );
        }
      } else {
        await updateUserNotifications({ ...updated });
        showToast("success", "Successfully updated notification preferences!");
      }
    } catch (error) {
      let message: string = "An unknown error occurred.";
      if (error instanceof ConvexError) {
        message = error.data?.message ?? "Unexpected error.";
      } else if (error instanceof Error) {
        message = error.message;
      }
      showToast("error", message);
    } finally {
      setPending(false);
    }
  };

  const handleUpdateNewsletterPrefs = async (
    handlerType: "frequency" | "type",
    value: NewsletterFrequency | NewsletterType[],
  ) => {
    setPending(true);
    try {
      const values = {
        email: newsletterData?.email ?? user?.email ?? "",
        newsletter: "active" as NewsletterStatusType,
        ...(handlerType === "frequency" && {
          frequency: value as NewsletterFrequency,
        }),
        ...(handlerType === "type" && { type: value as NewsletterType[] }),
        userPlan: userPlan ?? 0,
      };

      await updateNewsletterSubscription(values);
      showToast("success", "Successfully updated newsletter preferences");
    } catch (err) {
      let message: string =
        "An unknown error occurred. Please contact support.";
      if (err instanceof ConvexError) {
        if (err.data.includes("Log in to update")) {
          message = "Please log in to update your newsletter preferences";
        }
        showToast("error", message);
      }
    } finally {
      setPending(false);
    }
  };

  const handleRequestVerificationEmail = async () => {
    if (!newsletterData?.subId) return;
    try {
      setVerificationPendingSend(true);
      const result = await requestVerificationEmail({
        subId: newsletterData.subId,
      });
      if (result.success) {
        showToast("success", "Verification email sent!");
        setVerificationSent(true);
      } else {
        showToast(
          "error",
          "An unknown error occurred. Please try again later.",
        );
      }
    } catch (error) {
      console.error("Failed to request verification email:", error);
    } finally {
      setTimeout(() => {
        setVerificationSent(false);
      }, 5000);
      setVerificationPendingSend(false);
    }
  };
  return (
    <>
      <Card
        aria-description="Notifications Settings"
        className="dark:bg-tab-a10"
      >
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <SectionGroup
            fontSize={fontSize}
            title="In-App Notifications"
            icon={Bell}
            description="Receive notifications for new events, open calls, and other helpful updates"
            group={{
              disabled: pending,
              sectionToggleAction: (value) => {
                const defaultBase = {
                  events: true,
                  openCalls: minBananaUser ? true : false,
                  resources: true,
                  account: true,
                };
                if (value === false) {
                  handleUpdateinAppNotifications(value);
                } else {
                  handleUpdateinAppNotifications(
                    isAdmin
                      ? {
                          ...defaultBase,
                          submissions: true,
                          tasks: true,
                          users: true,
                          subscriptions: {
                            newSub: true,
                            canceledSub: true,
                          },
                          onlineEvents: {
                            registrations: true,
                            cancellations: true,
                          },
                          support: {
                            ticketCreated: true,
                            ticketUpdated: true,
                          },
                          social: {
                            scheduled: true,
                            unscheduled: true,
                            reminder: true,
                          },
                          newsletter: {
                            campaign: {
                              created: true,
                              completed: true,
                              failed: true,
                            },
                            audience: {
                              subscribed: true,
                              unsubscribed: true,
                            },
                          },
                        }
                      : defaultBase,
                  );
                }
              },
              sectionToggleValue: hasAnyTrueValue(rawInAppNotifications),
              separator: false,
            }}
          >
            {/* <SectionItem
            icon={Bell}
            title="In-App Notifications"
            description="Receive notifications for new events, open calls, and other helpful updates"
            fontSize={fontSize}
          >
            <Switch
            disabled={pending}
              checked={!!rawInAppNotifications}
              onCheckedChange={(value) => handleUpdateinAppNotifications(value)}
            />
          </SectionItem> */}

            <SectionGroup
              fontSize={fontSize}
              title="Opportunities"
              icon={ScrollText}
              description="Notifications for new events, open calls, resources, and more"
              group={{
                disabled: pending,
                sectionToggleAction: (value) =>
                  handleUpdateinAppNotifications({
                    events: value,
                    openCalls: value,
                    resources: value,
                  }),
                sectionToggleValue:
                  (inAppNotifications?.events ?? false) ||
                  (inAppNotifications?.openCalls ?? false) ||
                  (inAppNotifications?.resources ?? false),
              }}
            >
              <SectionItem
                icon={Calendar}
                title="Events"
                description="Receive notifications for new events"
                type="toggle"
                fontSize={fontSize}
              >
                <Switch
                  disabled={pending}
                  checked={inAppNotifications?.events ?? false}
                  onCheckedChange={(value) =>
                    handleUpdateinAppNotifications({ events: value })
                  }
                />
              </SectionItem>
              <SectionItem
                icon={Megaphone}
                title="Open Calls"
                description="Receive notifications for new open calls when they're added"
                type="toggle"
                disabled={!minBananaUser}
                subTitle={
                  minBananaUser ? undefined : "Requires minimum Banana Cap Plan"
                }
                fontSize={fontSize}
              >
                <Switch
                  disabled={pending}
                  checked={
                    (minBananaUser && inAppNotifications?.openCalls) ?? false
                  }
                  onCheckedChange={(value) =>
                    handleUpdateinAppNotifications({ openCalls: value })
                  }
                />
              </SectionItem>
              <SectionItem
                icon={Monitor}
                title="Resources"
                description="Receive notifications for new resources when they're added"
                type="toggle"
                fontSize={fontSize}
              >
                <Switch
                  disabled={pending}
                  checked={inAppNotifications?.resources ?? false}
                  onCheckedChange={(value) =>
                    handleUpdateinAppNotifications({ resources: value })
                  }
                />
              </SectionItem>
            </SectionGroup>
            {isUser && (
              <>
                <Separator />
                <SectionItem
                  icon={Bell}
                  title="Account"
                  description="Account Notifications (Billing, settings, support, etc.)"
                  type="toggle"
                  fontSize={fontSize}
                >
                  <Switch
                    disabled={pending}
                    checked={inAppNotifications?.account ?? false}
                    onCheckedChange={(value) =>
                      handleUpdateinAppNotifications({ account: value })
                    }
                  />
                </SectionItem>
              </>
            )}
            {/* Admin Section */}
            {isAdmin && (
              <>
                <SectionGroup
                  fontSize={fontSize}
                  title="Admin"
                  icon={Shield}
                  description="Admin-only notifications
    "
                  group={{
                    disabled: pending,
                    sectionToggleAction: (value) =>
                      handleUpdateinAppNotifications({
                        submissions: value,
                        tasks: value,
                        users: value,
                        subscriptions: {
                          newSub: value,
                          canceledSub: value,
                        },
                      }),
                    sectionToggleValue:
                      (inAppNotifications?.submissions ?? false) ||
                      (inAppNotifications?.tasks ?? false) ||
                      (inAppNotifications?.users ?? false) ||
                      hasAnyTrueValue(inAppNotifications?.subscriptions),
                  }}
                >
                  <SectionItem
                    icon={MdOutlinePendingActions}
                    title="Submissions"
                    description="Receive notifications for new submissions (event & open call)"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={inAppNotifications?.submissions ?? false}
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({ submissions: value })
                      }
                    />
                  </SectionItem>
                  <SectionItem
                    icon={ListTodo}
                    title="Tasks"
                    description="Receive notifications for new tasks assigned to you"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={inAppNotifications?.tasks ?? false}
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({ tasks: value })
                      }
                    />
                  </SectionItem>
                  <SectionItem
                    icon={UserPlus}
                    title="New Users"
                    description="Receive notifications for new user signups"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={inAppNotifications?.users ?? false}
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({ users: value })
                      }
                    />
                  </SectionItem>
                  <SectionGroup
                    fontSize={fontSize}
                    title="Subscriptions"
                    icon={PiggyBank}
                    description="User subscription notifications"
                    group={{
                      disabled: pending,
                      sectionToggleAction: (value) =>
                        handleUpdateinAppNotifications({
                          subscriptions: {
                            newSub: value,
                            canceledSub: value,
                          },
                        }),
                      sectionToggleValue: hasAnyTrueValue(
                        inAppNotifications?.subscriptions,
                      ),
                    }}
                  >
                    <SectionItem
                      icon={Bell}
                      title="New Subscription"
                      description="New user subscription"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.subscriptions?.newSub ?? false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            subscriptions: {
                              ...inAppNotifications?.subscriptions,
                              newSub: value,
                            },
                          })
                        }
                      />
                    </SectionItem>
                    <SectionItem
                      icon={Bell}
                      title="Canceled Subscription"
                      description="Canceled user subscription"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.subscriptions?.canceledSub ??
                          false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            subscriptions: {
                              ...inAppNotifications?.subscriptions,
                              canceledSub: value,
                            },
                          })
                        }
                      />
                    </SectionItem>
                  </SectionGroup>
                </SectionGroup>
                <SectionGroup
                  fontSize={fontSize}
                  title="Newsletter"
                  icon={Newspaper}
                  description="Notifications for newsletter campaigns, audience, and more"
                  group={{
                    disabled: pending,
                    sectionToggleAction: (value) =>
                      handleUpdateinAppNotifications({
                        newsletter: {
                          campaign: {
                            created: value,
                            completed: value,
                            failed: value,
                          },
                          audience: {
                            subscribed: value,
                            unsubscribed: value,
                          },
                        },
                      }),
                    sectionToggleValue:
                      hasAnyTrueValue(
                        inAppNotifications?.newsletter?.campaign,
                      ) ||
                      hasAnyTrueValue(inAppNotifications?.newsletter?.audience),
                  }}
                >
                  <SectionGroup
                    fontSize={fontSize}
                    title="Campaign"
                    icon={Table}
                    description="Newsletter Campaign notifications"
                    group={{
                      disabled: pending,
                      sectionToggleAction: (value) =>
                        handleUpdateinAppNotifications({
                          newsletter: {
                            campaign: {
                              created: value,
                              completed: value,
                              failed: value,
                            },
                            audience: {
                              ...inAppNotifications?.newsletter?.audience,
                            },
                          },
                        }),
                      sectionToggleValue: hasAnyTrueValue(
                        inAppNotifications?.newsletter?.campaign,
                      ),
                    }}
                  >
                    <SectionItem
                      icon={Bell}
                      title="Created"
                      description="Created newsletter campaign notifications"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.newsletter?.campaign?.created ??
                          false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            newsletter: {
                              campaign: {
                                ...inAppNotifications?.newsletter?.campaign,
                                created: value,
                              },
                              audience: {
                                ...inAppNotifications?.newsletter?.audience,
                              },
                            },
                          })
                        }
                      />
                    </SectionItem>
                    <SectionItem
                      icon={Bell}
                      title="Completed"
                      description="Completed newsletter campaign notifications"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.newsletter?.campaign?.completed ??
                          false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            newsletter: {
                              campaign: {
                                ...inAppNotifications?.newsletter?.campaign,
                                completed: value,
                              },
                              audience: {
                                ...inAppNotifications?.newsletter?.audience,
                              },
                            },
                          })
                        }
                      />
                    </SectionItem>
                    <SectionItem
                      icon={Bell}
                      title="Failed"
                      description="Failed newsletter campaign notifications"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.newsletter?.campaign?.failed ??
                          false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            newsletter: {
                              campaign: {
                                ...inAppNotifications?.newsletter?.campaign,
                                failed: value,
                              },
                              audience: {
                                ...inAppNotifications?.newsletter?.audience,
                              },
                            },
                          })
                        }
                      />
                    </SectionItem>
                  </SectionGroup>
                  <SectionGroup
                    fontSize={fontSize}
                    title="Audience"
                    icon={Users2}
                    description="Newsletter Audience notifications"
                    group={{
                      disabled: pending,
                      sectionToggleAction: (value) =>
                        handleUpdateinAppNotifications({
                          newsletter: {
                            campaign: {
                              ...inAppNotifications?.newsletter?.campaign,
                            },
                            audience: {
                              subscribed: value,
                              unsubscribed: value,
                            },
                          },
                        }),
                      sectionToggleValue: hasAnyTrueValue(
                        inAppNotifications?.newsletter?.audience,
                      ),
                    }}
                  >
                    <SectionItem
                      icon={Bell}
                      title="Subscribed"
                      description="New subscribers notifications"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.newsletter?.audience
                            ?.subscribed ?? false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            newsletter: {
                              campaign: {
                                ...inAppNotifications?.newsletter?.campaign,
                              },
                              audience: {
                                ...inAppNotifications?.newsletter?.audience,
                                subscribed: value,
                              },
                            },
                          })
                        }
                      />
                    </SectionItem>
                    <SectionItem
                      icon={Bell}
                      title="Unsubscribed"
                      description="Audience unsubscribed notifications"
                      type="toggle"
                      fontSize={fontSize}
                    >
                      <Switch
                        disabled={pending}
                        checked={
                          inAppNotifications?.newsletter?.audience
                            ?.unsubscribed ?? false
                        }
                        onCheckedChange={(value) =>
                          handleUpdateinAppNotifications({
                            newsletter: {
                              campaign: {
                                ...inAppNotifications?.newsletter?.campaign,
                              },
                              audience: {
                                ...inAppNotifications?.newsletter?.audience,
                                unsubscribed: value,
                              },
                            },
                          })
                        }
                      />
                    </SectionItem>
                  </SectionGroup>
                </SectionGroup>
                <SectionGroup
                  fontSize={fontSize}
                  title="Online Events"
                  icon={Monitor}
                  description="Receive notifications for registrations and/or cancellations
"
                  group={{
                    disabled: pending,
                    sectionToggleAction: (value) =>
                      handleUpdateinAppNotifications({
                        onlineEvents: {
                          registrations: value,
                          cancellations: value,
                        },
                      }),
                    sectionToggleValue: hasAnyTrueValue(
                      inAppNotifications?.onlineEvents,
                    ),
                  }}
                >
                  <SectionItem
                    icon={UserPlus}
                    title="Registrations"
                    description="Receive notifications when new registrations are made"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={
                        inAppNotifications?.onlineEvents?.registrations ?? false
                      }
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          onlineEvents: {
                            ...inAppNotifications?.onlineEvents,
                            registrations: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                  <SectionItem
                    icon={UserMinus}
                    title="Cancellations"
                    description="Receive notifications when registrations are cancelled"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={
                        inAppNotifications?.onlineEvents?.cancellations ?? false
                      }
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          onlineEvents: {
                            ...inAppNotifications?.onlineEvents,
                            cancellations: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                </SectionGroup>
                <SectionGroup
                  fontSize={fontSize}
                  title="Socials"
                  icon={FaMobileAlt}
                  description="Receive notifications for social media post scheduling
"
                  group={{
                    disabled: pending,
                    sectionToggleAction: (value) =>
                      handleUpdateinAppNotifications({
                        social: {
                          scheduled: value,
                          unscheduled: value,
                          reminder: value,
                        },
                      }),
                    sectionToggleValue: hasAnyTrueValue(
                      inAppNotifications?.social,
                    ),
                  }}
                >
                  <SectionItem
                    icon={Bell}
                    title="Scheduled Posts"
                    description="Receive notifications when posts are scheduled"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={inAppNotifications?.social?.scheduled ?? false}
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          social: {
                            ...inAppNotifications?.social,
                            scheduled: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                  <SectionItem
                    icon={Bell}
                    title="Unscheduled Posts"
                    description="Receive notifications when new posts are added to the queue"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={inAppNotifications?.social?.unscheduled ?? false}
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          social: {
                            ...inAppNotifications?.social,
                            unscheduled: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                  <SectionItem
                    icon={Bell}
                    title="Post Reminders"
                    description="Receive notifications on days with scheduled posts"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={inAppNotifications?.social?.reminder ?? false}
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          social: {
                            ...inAppNotifications?.social,
                            reminder: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                </SectionGroup>
                <SectionGroup
                  fontSize={fontSize}
                  title="Support"
                  icon={HelpCircle}
                  description="Support Notifications
    "
                  group={{
                    disabled: pending,
                    sectionToggleAction: (value) =>
                      handleUpdateinAppNotifications({
                        support: {
                          ticketCreated: value,
                          ticketUpdated: value,
                        },
                      }),
                    sectionToggleValue: hasAnyTrueValue(
                      inAppNotifications?.support,
                    ),
                  }}
                >
                  <SectionItem
                    icon={Bell}
                    title="Ticket Created"
                    description="Receive notifications when a new support ticket is created"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={
                        inAppNotifications?.support?.ticketCreated ?? false
                      }
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          support: {
                            ...inAppNotifications?.support,
                            ticketCreated: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                  <SectionItem
                    icon={Bell}
                    title="Ticket Updated"
                    description="Receive notifications when a support ticket is updated"
                    type="toggle"
                    fontSize={fontSize}
                  >
                    <Switch
                      disabled={pending}
                      checked={
                        inAppNotifications?.support?.ticketUpdated ?? false
                      }
                      onCheckedChange={(value) =>
                        handleUpdateinAppNotifications({
                          support: {
                            ...inAppNotifications?.support,
                            ticketUpdated: value,
                          },
                        })
                      }
                    />
                  </SectionItem>
                </SectionGroup>
              </>
            )}
          </SectionGroup>
          <Separator />
          <SectionItem
            icon={Globe}
            title="General Emails"
            description="Emails about upcoming updates to the site, user surveys, and
                    other news related to The Street Art List"
            type="toggle"
            fontSize={fontSize}
          >
            <Switch
              disabled={pending}
              checked={!!userPref?.notifications?.general}
              onCheckedChange={(value) =>
                handleUpdateNotifications("general", value)
              }
            />
          </SectionItem>

          <Separator />
          <SectionItem
            icon={Newspaper}
            title="Newsletter"
            description={`Receive ${userPlan > 1 ? "weekly/monthly" : "monthly"} newsletter`}
            type="toggle"
            fontSize={fontSize}
          >
            <Switch
              disabled={pending}
              checked={newsletterData?.success ?? false}
              onCheckedChange={(value) =>
                handleUpdateNotifications("newsletter", value)
              }
            />
          </SectionItem>

          {!!newsletterData?.success && !newsletterData?.verified && (
            <div
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-1.5 bg-salYellowLt p-3 sm:flex-row",
              )}
            >
              <span className="font-semibold">
                Please verify your email address to receive the newsletter
              </span>
              <Button
                variant="outline"
                className="w-full min-w-25 bg-card px-2 !text-base font-bold sm:w-auto"
                size={isMobile ? "lg" : "sm"}
                onClick={handleRequestVerificationEmail}
              >
                {verificationPendingSend ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : verificationSent ? (
                  "Verification Sent!"
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>
          )}

          <Separator />
          <SectionItem
            icon={Mail}
            title="Application Notifications"
            description="Receive email updates for applications"
            fontSize={fontSize}
            type="toggle"
            disabled
            comingSoon
          >
            <Switch
              disabled
              checked={!!userPref?.notifications?.applications}
              onCheckedChange={(value) =>
                handleUpdateNotifications("applications", value)
              }
            />
          </SectionItem>
        </CardContent>
      </Card>
      {userPlan > 1 && signedUpForNewsletter && (
        <Card>
          <CardHeader>
            <CardTitle>Newsletter</CardTitle>
            <CardDescription>
              Manage your newsletter preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Separator />
              <SectionItem
                icon={MailSearch}
                title="Newsletter Type(s)"
                description="Choose general and/or open call newsletters (1 minimum)"
                fontSize={fontSize}
              >
                <MultiSelect
                  options={newsletterTypeOptions.map((opt) =>
                    opt.value === "openCall" && !minBananaUser
                      ? { ...opt, disabled: true, premium: true }
                      : opt,
                  )}
                  onValueChange={(value) => {
                    handleUpdateNewsletterPrefs(
                      "type",

                      value.length === 0
                        ? ["general"]
                        : (value as NewsletterType[]),
                    );
                  }}
                  value={newsletterData?.type || ["general"]}
                  placeholder="Select account type(s)"
                  variant="basic"
                  maxCount={2}
                  condensed={isMobile}
                  fallbackValue={["general"]}
                  height={11}
                  hasSearch={false}
                  selectAll={false}
                  className={cn(
                    "w-full border-1.5 border-foreground/20 sm:h-11 sm:max-w-[19rem]",
                  )}
                  fontSize={fontSize}
                />
              </SectionItem>

              {newsletterData?.type.includes("openCall") && (
                <>
                  <Separator />
                  <SectionItem
                    icon={Clock}
                    title="Preferred Frequency"
                    description="Frequency of open call-related newsletters. Weekly is only available for site members"
                    fontSize={fontSize}
                  >
                    <SelectSimple
                      options={newsletterFrequencyOptions.map((opt) =>
                        opt.value === "weekly" && !minBananaUser
                          ? { ...opt, disabled: true, premium: true }
                          : opt,
                      )}
                      value={newsletterData?.frequency ?? "monthly"}
                      onChangeAction={(value) =>
                        handleUpdateNewsletterPrefs(
                          "frequency",
                          value as NewsletterFrequency,
                        )
                      }
                      placeholder="Select frequency"
                      className="w-full border-1.5 border-foreground/20 bg-card placeholder:text-foreground sm:h-11 sm:max-w-40"
                      center
                    />
                  </SectionItem>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
