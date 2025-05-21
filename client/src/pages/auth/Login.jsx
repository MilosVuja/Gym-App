import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pinCode, setPinCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, pinCode });
    // Add login logic here
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-12 px-4 text-white">
      <div className="logo mb-8">
        <img
          src="/images/heavy-bar-logo.png"
          alt="logo"
          className="h-40 object-contain"
        />
      </div>

      <div className="w-full max-w-md mt-12">
        <h3 className="text-3xl text-red-600 uppercase font-bold text-center mb-12">
          Log into your account
        </h3>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-6">
            <div className="email">
              <label htmlFor="email" className="block mb-1 text-sm font-semibold">
                Email:
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="pin-number">
              <label htmlFor="pinCode" className="block mb-1 text-sm font-semibold">
                PIN code:
              </label>
              <input
                type="text"
                id="pinCode"
                placeholder="your pin code"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-3 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-center">
              <input
                type="submit"
                value="Log in"
                className="w-1/2 py-3 px-4 mt-4 border-2 border-red-600 text-white font-bold rounded-xl hover:bg-red-600 hover:text-black cursor-pointer transition duration-200"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
