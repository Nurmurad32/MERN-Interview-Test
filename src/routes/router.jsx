import { createBrowserRouter, } from "react-router-dom";
import AllDrawings from "../pages/AllDrawings";
import ViewDrawing from "../pages/ViewDrawing";
import Whiteboard from "../pages/Whiteboard";

const router = createBrowserRouter([
  { path: "/", element: <Whiteboard />, },
  { path: "/whiteboard/:id", element: <Whiteboard />, },
  { path: "/drawings", element: <AllDrawings />, },
  { path: "/drawings/:id", element: <ViewDrawing />, },
]);

export default router;