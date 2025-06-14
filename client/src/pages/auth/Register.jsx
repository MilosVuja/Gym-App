import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:3000/api/v1/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role: "member",
      });

      window.location.href = "/login";

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center justify-center px-4 text-white">
      <div className="logo mb-8">
        <img
          src="/images/heavy-bar-logo.png"
          alt="logo"
          className="h-40 object-contain"
        />
      </div>

      <div className="w-full max-w-md mt-0">
        <h3 className="text-3xl text-red-600 uppercase font-bold text-center mb-12">
          Create a new account
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label htmlFor="firstName" className="block mb-1 font-bold">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              required
              className="w-full bg-transparent border border-red-700 rounded py-3 px-2"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="lastName" className="block mb-1 font-bold">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              required
              className="w-full bg-transparent border border-red-700 rounded py-3 px-2"
              placeholder="Your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block mb-1 font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full bg-transparent border border-red-700 rounded py-3 px-2"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-1 font-bold">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="w-full bg-transparent border border-red-700 rounded py-3 px-2"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-1 font-bold">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              className="w-full bg-transparent border border-red-700 rounded py-3 px-2"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
