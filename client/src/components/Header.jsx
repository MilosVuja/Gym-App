import logo from '../assets/heavy-bar-logo.png';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add actual logout logic here
    navigate('/logout');
  };

  return (
    <header className="flex justify-between items-center bg-black h-[8vh] px-4">
      <div className="ml-4">
        <img
          src={logo}
          alt="logo"
          className="h-[5vh]"
        />
      </div>


      <nav className="mr-8">
        <button
          onClick={handleLogout}
          className="border-2 border-red-600 text-white rounded-xl font-bold text-sm px-4 py-2 hover:bg-red-600 hover:text-black transition-colors duration-300"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}