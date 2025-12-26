import type { ReactNode } from "react";

import React from "react";

type AuthLayoutProps = {
  children?: ReactNode;
};

// Extend React.FC with a static "theme" property
interface PageWithTheme extends React.FC<AuthLayoutProps> {
  theme?: string;
}

const AuthLayout: PageWithTheme = ({ children }) => {
  return <>{children}</>;
};

AuthLayout.theme = "sal";

export default AuthLayout;
