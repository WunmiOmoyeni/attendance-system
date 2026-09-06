
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  location: {
    id: string;
    name: string;
    address: string;
  } | null;
};

type Attendance = {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
};

type Location = {
  id: string;
  name: string;
  address: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check logged-in user
        const meResponse = await fetch("/api/auth/me");

        if (!meResponse.ok) {
          router.replace("/login");
          return;
        }

        const meData = await meResponse.json();

        if (meData.user.role !== "ADMIN") {
          router.replace("/attendance");
          return;
        }

        setUser(meData.user);

        // Fetch users, locations and attendance
        const [usersResponse, locationsResponse, attendanceResponse] =
          await Promise.all([
            fetch("/api/admin/users"),
            fetch("/api/admin/locations"),
            fetch("/api/admin/attendance"),
          ]);

        const usersData = await usersResponse.json();
        const locationsData = await locationsResponse.json();
        const attendanceData = await attendanceResponse.json();

        setUsers(usersData.users || []);
        setLocations(locationsData.locations || []);
        setAttendance(attendanceData.attendance || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
  };

  // Only count attendance records from today
  const today = new Date();

  const todaysAttendance = attendance.filter((record) => {
    const clockInDate = new Date(record.clockIn);

    return (
      clockInDate.getDate() === today.getDate() &&
      clockInDate.getMonth() === today.getMonth() &&
      clockInDate.getFullYear() === today.getFullYear()
    );
  });

  const activeEmployees = users.filter(
    (employee) => employee.role === "EMPLOYEE" && employee.isActive
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attend.</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome, {user.name} 👋
          </h2>

          <p className="mt-2 text-gray-500">
            Manage employees, locations and attendance from here.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Active Employees</p>

            <p className="mt-2 text-3xl font-bold">
              {activeEmployees.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Locations</p>

            <p className="mt-2 text-3xl font-bold">
              {locations.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <p className="text-sm text-gray-500">
              Today's Attendance
            </p>

            <p className="mt-2 text-3xl font-bold">
              {todaysAttendance.length}
            </p>
          </div>
        </div>

        {/* Management sections */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <button
            onClick={() => router.push("/admin/users")}
            className="rounded-2xl bg-white border p-6 text-left hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">
              Manage Employees
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Create, view and manage employee accounts.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/locations")}
            className="rounded-2xl bg-white border p-6 text-left hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">
              Manage Locations
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add and manage attendance locations.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/attendance")}
            className="rounded-2xl bg-white border p-6 text-left hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">
              Attendance Records
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              View employee attendance and work hours.
            </p>
          </button>
        </div>
      </section>
    </main>
  );
}

