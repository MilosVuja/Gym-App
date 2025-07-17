import { useState, useEffect } from "react";
import { ProfilePictureContext } from "./ProfilePictureContext";

export const ProfilePictureProvider = ({ children }) => {
  const [imageSrc, setImageSrc] = useState("/assets/profile.jpg");

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

  useEffect(() => {
    fetchProfilePic();
  }, []);

  return (
    <ProfilePictureContext.Provider value={{ imageSrc, setImageSrc, fetchProfilePic }}>
      {children}
    </ProfilePictureContext.Provider>
  );
};
