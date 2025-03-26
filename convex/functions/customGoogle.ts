import type { OAuthConfig, OAuthUserConfig } from "@auth/core/providers"
import GoogleProvider, { type GoogleProfile } from "@auth/core/providers/google"

export function CustomGoogle(
  options: OAuthUserConfig<GoogleProfile>
): OAuthConfig<GoogleProfile> {
  return GoogleProvider({
    ...options,
    authorization: {
      ...options.authorization, // keep anything the user might have passed
      params: {
        ...(options.authorization?.params ?? {}),
        prompt: "select_account", // 👈 always add or override this param
      },
    },
  })
}
