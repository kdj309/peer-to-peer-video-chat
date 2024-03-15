import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Room from "./pages/room.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import SocketProvider from "./context/socket.jsx";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/room/:userid/:id",
    element: <Room />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <RouterProvider router={router}></RouterProvider>
  </SocketProvider>
);
