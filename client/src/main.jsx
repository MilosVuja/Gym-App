import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProfilePictureProvider } from "./context/ProfilePictureProvider";
import App from "./App";
import { Provider } from 'react-redux';
import { store } from '../src/redux/store';
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfilePictureProvider>
        <Provider store={store}>
        <App />
        </Provider>
        </ProfilePictureProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
