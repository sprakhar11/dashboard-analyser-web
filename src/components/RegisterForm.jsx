/**
 * RegisterForm component.
 * Renders name, email, and password inputs with a submit button.
 * @param {{ onSubmit: (name: string, email: string, password: string) => void }} props
 */
export default function RegisterForm({ onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.elements.name.value;
        const email = form.elements.email.value;
        const password = form.elements.password.value;
        onSubmit(name, email, password);
      }}
    >
      <label htmlFor="register-name">Name</label>
      <input id="register-name" type="text" name="name" required />

      <label htmlFor="register-email">Email</label>
      <input id="register-email" type="email" name="email" required />

      <label htmlFor="register-password">Password</label>
      <input id="register-password" type="password" name="password" required />

      <button type="submit">Register</button>
    </form>
  );
}
