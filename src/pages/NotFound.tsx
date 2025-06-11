
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Determine the correct base path for GitHub Pages
  const basename = import.meta.env.PROD ? '/lessons-learnt' : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-4">
          Requested path: {location.pathname}
        </p>
        <a 
          href={`${basename}/`} 
          className="text-blue-500 hover:text-blue-700 underline mr-4"
        >
          Return to Home
        </a>
        <a 
          href={`${basename}/console`} 
          className="text-green-500 hover:text-green-700 underline"
        >
          Admin Login
        </a>
      </div>
    </div>
  );
};

export default NotFound;
