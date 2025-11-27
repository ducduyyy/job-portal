import { useRole } from "./RoleProvider";

export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useRole();

  return (
    <div className="p-4 bg-gray-100 border-b flex gap-2">
      <span>Current Role: {currentRole}</span>
      <button onClick={() => setCurrentRole("candidate")} className="px-2 py-1 bg-blue-200 rounded">
        Candidate
      </button>
      <button onClick={() => setCurrentRole("employer")} className="px-2 py-1 bg-green-200 rounded">
        Employer
      </button>
      <button onClick={() => setCurrentRole("admin")} className="px-2 py-1 bg-red-200 rounded">
        Admin
      </button>
    </div>
  );
}
