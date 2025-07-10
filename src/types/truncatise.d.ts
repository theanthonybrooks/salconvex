declare module "truncatise" {
  export interface TruncatiseOptions {
    TruncateLength: number;
    TruncateBy?: "characters" | "words" | "paragraphs";
    StripHTML?: boolean;
    Strict?: boolean;
    Suffix?: string;
  }
  const truncatise: (html: string, options: TruncatiseOptions) => string;
  export default truncatise;
}
