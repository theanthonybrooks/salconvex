import RegisterForm from "@/components/auth/register-form"

type Props = {}

function RegisterPage({}: Props) {
  return <RegisterForm switchFlow={() => console.log("switched!")} />
}

export default RegisterPage
