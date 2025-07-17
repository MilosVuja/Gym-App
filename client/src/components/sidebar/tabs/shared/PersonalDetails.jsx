import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { FaCamera } from "react-icons/fa";
import getCroppedImg from "../../../../utilities/cropImage";
import ProfilePicture from "../../../ProfilePicture";
import { useProfilePicture } from "../../../../context/ProfilePictureContext.jsx";

const PersonalDetails = () => {
  const defaultData = {
    img: "/assets/profile.jpg",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
  };

  const [formData, setFormData] = useState(defaultData);
  const { imageSrc, setImageSrc } = useProfilePicture();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push("First name is required.");
    if (!formData.lastName.trim()) errors.push("Last name is required.");
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errors.push("Valid email is required.");
    if (!formData.phone.match(/^\d{6,}$/))
      errors.push("Phone number must be at least 6 digits.");
    if (!formData.address.trim()) errors.push("Address is required.");
    if (!formData.gender) errors.push("gender is required.");
    return errors;
  };

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/members/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch member");
        }

        const member = data.data.member;

        setFormData((prev) => ({
          ...prev,
          firstName: member.firstName || "",
          lastName: member.lastName || "",
          email: member.email || "",
          phone: member.phoneNumber?.replace("+3816", "") || "",
          address: member.address || "",
          gender: member.gender || "",
          img: member.profilePicture
            ? member.profilePicture.startsWith("http")
              ? member.profilePicture
              : `http://localhost:3000/${member.profilePicture.replace(
                  /^\/+/,
                  ""
                )}`
            : "/assets/profile.jpg",
        }));
      } catch (err) {
        console.error("Failed to load member:", err);
      }
    };

    fetchMember();
  }, []);

  const loadImageSrcFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Error loading image for cropper", err);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      alert("Please fix the following:\n\n" + errors.join("\n"));
      return;
    }

    try {
      const blob = await fetch(formData.img).then((res) => res.blob());
      const fullPhone = `+3816${formData.phone}`;

      const formDataToSend = new FormData();
      formDataToSend.append("profilePicture", blob, "profile.jpeg");
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", fullPhone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("gender", formData.gender);

      const res = await fetch(
        "http://localhost:3000/api/v1/members/update-me",
        {
          method: "PATCH",
          body: formDataToSend,
          credentials: "include",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Update failed");
      }

      const newProfilePicUrl = result.data.member.profilePicture;
      const fullUrl = newProfilePicUrl.startsWith("http")
        ? newProfilePicUrl
        : `http://localhost:3000/${newProfilePicUrl.replace(/^\/+/, "")}`;

      setImageSrc(fullUrl);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to reset the form?")) {
      setFormData(defaultData);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReCrop = async () => {
    if (formData.img) {
      const src = await loadImageSrcFromUrl(formData.img);
      if (src) {
        setImageSrc(src);
        setShowCropper(true);
      } else {
        alert("Failed to load image for cropping");
      }
    } else {
      alert("No uploaded picture to crop.");
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData((prev) => ({ ...prev, img: croppedImage }));
      setImageSrc(croppedImage);
      setShowCropper(false);

      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, setImageSrc]);

  return (
    <div className="text-white min-h-screen flex flex-col items-center px-6 py-10">
      <h1 className="text-4xl text-red-600 font-bold font-handwriting mb-8">
        Your Profile
      </h1>

      {showCropper && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setShowCropper(false)}
        >
          <div
            className="relative w-[300px] h-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="w-64 mt-4">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
              aria-label="Zoom"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={showCroppedImage}
              className="bg-red-700 px-4 py-2 rounded-full text-white hover:bg-red-500"
            >
              Save Image
            </button>
            <button
              onClick={() => setShowCropper(false)}
              className="bg-gray-700 px-4 py-2 rounded-full text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center gap-10"
      >
        <div className="relative cursor-pointer">
          <ProfilePicture
            src={formData.img}
            onClick={handleReCrop}
            className="w-60 h-60 border-4 border-red-900"
          />
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <label
            htmlFor="profile-upload"
            className="absolute bottom-3 right-3 bg-gray-700 hover:bg-black text-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-md cursor-pointer"
            title="Change Profile Picture"
          >
            <FaCamera className="text-xl" />
          </label>
        </div>

        <div className="border border-red-700 p-6 rounded-md w-full md:w-[700px] bg-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName">First name:</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label htmlFor="lastName">Last name:</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label htmlFor="phone">Phone number:</label>
              <div className="flex items-center gap-1 relative">
                <span className="text-white bg-black border-b border-red-700 px-1 py-1">
                  +381/6
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,8}$/.test(input)) {
                      setFormData((prev) => ({ ...prev, phone: input }));
                      if (input.length === 8) {
                        e.target.blur();
                      }
                    }
                  }}
                  placeholder="1234567"
                  className={`bg-black border-b w-full focus:outline-none py-1 ${
                    formData.phone.length > 8 || formData.phone.length < 7
                      ? "border-red-500"
                      : "border-green-600"
                  }`}
                />
                {formData.phone.length > 0 &&
                  (formData.phone.length < 7 || formData.phone.length > 8) && (
                    <span className="absolute -bottom-5 left-0 text-xs text-red-500">
                      Must be 7–8 digits after +381-6
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="address">Address:</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="bg-black border-b border-red-700 w-full focus:outline-none py-1"
              />
            </div>
            <div>
              <label htmlFor="gender">Gender:</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="bg-black border border-red-700 text-white w-full py-1"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleDelete}
              className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition cursor-pointer"
            >
              Delete
            </button>
            <button
              type="submit"
              className="bg-red-900 text-white rounded-full px-6 py-2 hover:bg-red-700 transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
