import {
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

export function VerificationCodeEmail({
  code,
  expires,
}: {
  code: string
  expires: Date
}) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Container className='container px-20 font-sans'>
          <Heading className='text-xl font-bold mb-4'>
            Sign in to The Street Art List
          </Heading>
          <Text className='text-sm'>
            Please enter the following code on the sign in page.
          </Text>
          <Section className='text-center'>
            <Text className='font-semibold'>Verification code</Text>
            <Text className='font-bold text-4xl'>{code}</Text>
            <Text>
              (This code is valid for{" "}
              {Math.floor((+expires - Date.now()) / (60 * 60 * 1000))} hours)
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  )
}

// export const VerificationHtmlEmail = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your email</title>
//     <style>
//         body {
//             font-family: sans-serif;
//             padding: 20px;
//             background-color: #f9fafb;
//         }
//         .container {
//             max-width: 600px;
//             margin: auto;
//             background-color: #ffffff;
//             border-radius: 8px;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//             padding: 20px;
//         }
//         .heading {
//             font-size: 1.5rem;
//             font-weight: bold;
//             margin-bottom: 1rem;
//         }
//         .text-sm {
//             font-size: 0.875rem;
//             margin-bottom: 1rem;
//         }
//         .section {
//             text-align: center;
//             margin-top: 2rem;
//         }
//         .verification-code {
//             font-size: 2.5rem;
//             font-weight: bold;
//             margin: 1rem 0;
//         }
//         .subtext {
//             font-size: 1rem;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="heading">Sign in to The Street Art List</div>
//         <div class="text-sm">Please enter the following code on the sign in page.</div>
//         <div class="section">
//             <div class="subtext">Verification code</div>
//             <div class="verification-code">${token}</div>
//             <div class="subtext">(This code is valid for ${validHours} hours)</div>
//         </div>
//     </div>
// </body>
// </html>
// `
