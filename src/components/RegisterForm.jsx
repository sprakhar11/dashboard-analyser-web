/**
 * RegisterForm component.
 * Renders name, email, password, age, and gender inputs with a submit button.
 * @param {{ onSubmit: (data: { name: string, email: string, password: string, genderId: number, age: number }) => void }} props
 */
export default function RegisterForm({ onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target;
        onSubmit({
          name: form.elements.name.value,
          email: form.elements.email.value,
          password: form.elements.password.value,
          age: Number(form.elements.age.value),
          genderId: Number(form.elements.genderId.value),
        });
      }}
    >
      <label htmlFor="register-name">Name</label>
      <input id="register-name" type="text" name="name" required />

      <label htmlFor="register-email">Email</label>
      <input id="register-email" type="email" name="email" required />

      <label htmlFor="register-password">Password</label>
      <input id="register-password" type="password" name="password" required />

      <label htmlFor="register-age">Age</label>
      <input id="register-age" type="number" name="age" min="1" max="150" required />

      <label htmlFor="register-gender">Gender</label>
      <select id="register-gender" name="genderId" required>
        <option value="1">Male</option>
        <option value="2">Female</option>
        <option value="3">Other</option>
      </select>

      <button type="submit">Register</button>
    </form>
  );
}
