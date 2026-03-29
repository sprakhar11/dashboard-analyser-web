/**
 * LoginForm component.
 * Renders email and password inputs with a submit button.
 * @param {{ onSubmit: (email: string, password: string) => void }} props
 */
export default function LoginForm({ onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.elements.email.value;
        const password = form.elements.password.value;
        onSubmit(email, password);
      }}
    >
      <label htmlFor="login-email">Email</label>
      <input id="login-email" type="email" name="email" required />

      <label htmlFor="login-password">Password</label>
      <input id="login-password" type="password" name="password" required />

      <button type="submit">Log in</button>
    </form>
  );
}
