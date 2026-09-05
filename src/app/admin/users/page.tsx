
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Location = {
  id: string;
  name: string;
  address: string;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  location: Location | null;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        // Check authentication
        const meResponse = await fetch("/api/auth/me");

        if (!meResponse.ok) {
          router.replace("/login");
          return;
        }

        const meData = await meResponse.json();

        // Only admins can access this page
        if (meData.user.role !== "ADMIN") {
          router.replace("/attendance");
          return;
        }

        // Get employees
        const response = await fetch("/api/admin/users");

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load employees");
          return;
        }

        setEmployees(data || []);
      } catch (error) {
        console.error(error);
        setError("Something went wrong while loading employees.");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading employees...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attend.</h1>
            <p className="text-sm text-gray-500">Employee Management</p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Employees</h2>
          <p className="mt-2 text-gray-500">
            View and manage employee accounts.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Employee table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {employees.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                No employees found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Location
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Role
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {employee.name}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {employee.email}
                      </td>

                      <td className="px-6 py-4">
                        {employee.location ? (
                          <div>
                            <p className="text-sm font-medium">
                              {employee.location.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {employee.location.address}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {employee.isActive ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {employee.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

