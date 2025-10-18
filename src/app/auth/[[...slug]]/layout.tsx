import React from "react";

interface AuthLayoutProps {
  children?: React.ReactNode;
}

// Extend React.FC with a static "theme" property
interface PageWithTheme extends React.FC<AuthLayoutProps> {
  theme?: string;
}

const AuthLayout: PageWithTheme = ({ children }) => {
  return <>{children}</>;
};

AuthLayout.theme = "sal";

export default AuthLayout;
