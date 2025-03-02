import { AuthFormProps, SIGN_IN_FORM, SIGN_UP_FORM } from "@/constants/forms"
import { LANDING_PAGE_MENU, MenuProps } from "./links"

type GroupleConstantsProps = {
  landingPageMenu: MenuProps[]
  signUpForm: AuthFormProps[]
  signInForm: AuthFormProps[]
  signInSuccessUrl: string // Define sign-in success URL
  signUpSuccessUrl: string // Define sign-up success URL
  completeSuccessUrl: string // Define complete success URL
  // groupList: GroupProps[]
  // createGroupPlaceholder: CreateGroupPlaceholderProps[]
}

export const GROUPLE_CONSTANTS: GroupleConstantsProps = {
  landingPageMenu: LANDING_PAGE_MENU,
  signUpForm: SIGN_UP_FORM,
  signInForm: SIGN_IN_FORM,
  signInSuccessUrl: "/", // where to go when signed in
  signUpSuccessUrl: "/pricing", // Set your sign-up success URL
  completeSuccessUrl: "/thelist2", // Set your complete success URL
  // groupList: GROUP_LIST,
  // createGroupPlaceholder: CREATE_GROUP_PLACEHOLDER,
}

export const { signInSuccessUrl, signUpSuccessUrl, completeSuccessUrl } =
  GROUPLE_CONSTANTS
