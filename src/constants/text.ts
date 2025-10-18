type TextProps = {
  text?: string;
  title?: string;
  description?: string;
};

export const footerCRText = (): TextProps => ({
  text: `© 2019-${new Date().getFullYear()} The Street Art List.`,
});
