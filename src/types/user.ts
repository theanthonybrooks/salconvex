interface User {
  createdAt: string
  email: string
  emailVerificationTime?: number
  password: string
  firstName: string
  lastName?: string
  name?: string
  accountType: string[]
  organizationName?: string
  source?: string
  emailVerified?: number
  image?: string
  userId: string
  role: string[]
  subscription?: string
  tokenIdentifier: string
}

interface UserPref {
  timezone?: string
  currency?: string
  theme?: string
}
