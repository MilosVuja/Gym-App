const PersonalDetails = () => {
  return (
    <div className="text-white min-h-screen flex flex-col items-center px-6 py-10">
      <h1 className="text-4xl text-red-600 font-bold font-handwriting mb-8">
        Your Profile
      </h1>

      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative">
          <img
            src="/assets/profile.jpg"
            alt="Profile"
            className="w-48 h-48 rounded-full object-cover border-4 border-red-900"
          />
          <button className="absolute bottom-3 right-3 bg-gray-700 text-white rounded-full p-2">
            <span role="img" aria-label="camera">
              📷
            </span>
          </button>
        </div>

        <div className="border border-red-700 p-6 rounded-md w-full md:w-[700px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label>First name:</label>
              <input
                type="text"
                defaultValue="Milos"
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label>Last name:</label>
              <input
                type="text"
                defaultValue="Vujicic"
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                defaultValue="miske-90@hotmail.com"
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label>Phone number:</label>
              <input
                type="text"
                defaultValue="0628480889"
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label>Address:</label>
              <input
                type="text"
                defaultValue="Gostivarska 1, Beograd"
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label>Sex:</label>
              <select className="bg-black border border-red-700 text-white w-full py-1">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition">
              Delete
            </button>
            <button className="bg-red-900 text-white rounded-full px-6 py-2 hover:bg-red-700 transition">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
