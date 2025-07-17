import { createContext, useContext } from "react";

export const ProfilePictureContext = createContext();

export const useProfilePicture = () => useContext(ProfilePictureContext);
