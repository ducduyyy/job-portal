// src/components/CurrentPath.jsx
import { useLocation, Link } from "react-router-dom";

export function CurrentPath() {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean); // tách theo "/"

  return (
    <div className="w-full bg-gray-100 py-3 px-8 shadow-sm text-sm text-gray-600">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          {pathParts.map((part, index) => {
            const path = "/" + pathParts.slice(0, index + 1).join("/");
            const isLast = index === pathParts.length - 1;
            return (
              <div key={path} className="flex items-center space-x-2">
                <span>/</span>
                {isLast ? (
                  <span className="font-medium text-gray-800 capitalize">
                    {decodeURIComponent(part.replace("-", " "))}
                  </span>
                ) : (
                  <Link to={path} className="text-blue-600 hover:underline capitalize">
                    {decodeURIComponent(part.replace("-", " "))}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
