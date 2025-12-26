// import { AuthScreen } from "@/features/auth/components/auth-screen"
import type { Metadata } from "next";

import AuthScreen from "@/features/auth/components/auth-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug: slugs } = await params;
  const slug = slugs ?? [];

  const pageTitle = slug.includes("sign-in") ? "Sign In" : "Sign Up";
  const pageDescription = slug.includes("sign-in")
    ? "Sign in to your account to access hundreds of street art open calls, organizer list, global street art event map, and more."
    : "Sign up for a membership to keep up with the latest open calls, projects and events or submit your own call and reach the global community of street artists, muralists, graffiti artists, and more.";
  return {
    title: `${pageTitle}`,
    description: pageDescription,
    robots: "noindex, follow",
  };
}

const AuthPage = () => {
  return <AuthScreen />;
};

export default AuthPage;
