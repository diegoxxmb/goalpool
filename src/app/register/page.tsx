import { registerAction } from "./actions";

export default function RegisterPage() {
  return (
    <form action={registerAction}>
      <input name="email" placeholder="email" />
      <input name="password" type="password" />

      <input name="first_name" placeholder="first name" />
      <input name="last_name" placeholder="last name" />
      <input name="alias" placeholder="alias" />
      <input name="phone" placeholder="phone" />

      <button type="submit">Register</button>
    </form>
  );
}