import { useProfilePicture } from "../../../app/context/ProfilePictureContext";

const ProfilePicture = ({ className = "", onClick }) => {
  const { imageSrc } = useProfilePicture();

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
