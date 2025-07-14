import { useEffect, useState } from "react";

const ProfilePicture = ({ className = "", onClick }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/members/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        const member = data.data.member;

        const fullUrl = member.profilePicture
          ? member.profilePicture.startsWith("http")
            ? member.profilePicture
            : `http://localhost:3000/${member.profilePicture.replace(/^\/+/, "")}`
          : "/assets/profile.jpg";

        setImageSrc(fullUrl);
      } catch (err) {
        console.error("Failed to load profile picture:", err);
        setImageSrc("/assets/profile.jpg");
      }
    };

    fetchProfilePic();
  }, []);

  if (!imageSrc) return null;

  return (
    <img
      src={imageSrc}
      alt="Profile"
      onClick={onClick}
      crossOrigin="anonymous"
      className={`object-cover rounded-full ${className}`}
    />
  );
};

export default ProfilePicture;
