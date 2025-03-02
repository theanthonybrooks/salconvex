export type AuthFormProps = {
    id: string
    type: "email" | "text" | "password"
    inputType: "select" | "input"
    options?: { value: string; label: string; id: string }[]
    label?: string
    placeholder: string
    name: string
    required?: boolean
}
export const SIGN_UP_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "First Name",
        name: "firstName",
        type: "text",
        required: true,
    },
    {
        id: "2",
        inputType: "input",
        placeholder: "Last Name",
        name: "lastName",
        type: "text",
        required: true,
    },
    {
        id: "3",
        inputType: "input",
        placeholder: "Email",
        name: "email",
        type: "email",
        required: true,
    },
    {
        id: "4",
        inputType: "input",
        placeholder: "Password",
        name: "password",
        type: "password",
        required: true,
    },
]

export const SIGN_IN_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "Email",
        name: "email",
        type: "email",
        required: true,
    },
    {
        id: "4",
        inputType: "input",
        placeholder: "Password",
        name: "password",
        type: "password",
        required: true,
    },
]
