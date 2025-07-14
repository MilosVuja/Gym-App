export default function ProfilePicture({
  src = "/assets/profile.jpg",
  borderColor = "border-red-900",
  className = "",
  alt = "Profile picture",
  onClick = null,
}) {
  return (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      onClick={onClick}
      className={`rounded-full object-cover border-4 ${borderColor} ${className}`}
      style={{ cursor: onClick ? "pointer" : "default" }}
      title={onClick ? "Click to edit profile picture" : undefined}
    />
  );
}
