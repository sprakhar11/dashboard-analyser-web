import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <h1>Profile</h1>
      <p>{user.name}</p>
      <p>{user.email}</p>
      {user.age != null && <p>Age: {user.age}</p>}
      {user.gender && <p>Gender: {user.gender.name}</p>}
      <button onClick={handleLogout}>Logout</button>
      <p><Link to="/">Back to Home</Link></p>
    </div>
  );
}
