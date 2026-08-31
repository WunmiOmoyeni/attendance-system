
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Location = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  location: Location | null;
};

type Attendance = {
  id: string;
  clockIn: string;
  clockOut: string | null;
  clockInLatitude: number;
  clockInLongitude: number;
  clockOutLatitude: number | null;
  clockOutLongitude: number | null;
  createdAt: string;
  location: Location;
};

export default function AttendancePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [todayAttendance, setTodayAttendance] =
    useState<Attendance | null>(null);

  const [history, setHistory] = useState<Attendance[]>([]);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  /*
   * Fetch logged-in user
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }

          setMessage(data.error || "Unable to load user information.");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Fetch user error:", error);
        setMessage("Unable to load user information.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [router]);

  /*
   * Fetch today's attendance
   */
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const response = await fetch("/api/attendance/today");

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }

          setMessage(data.error || "Unable to load today's attendance.");
          return;
        }

        setTodayAttendance(data.attendance || null);
      } catch (error) {
        console.error("Today's attendance error:", error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchTodayAttendance();
  }, [router]);

  /*
   * Fetch attendance history
   */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/attendance/history");

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }

          return;
        }

        setHistory(data.attendances || data.attendance || []);
      } catch (error) {
        console.error("Attendance history error:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [router]);

  /*
   * Get browser location
   */
  const getCurrentLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  /*
   * Clock in
   */
  const clockIn = async () => {
    setLoading(true);
    setMessage("");

    try {
      const coordinates = await getCurrentLocation();

      setLocation(coordinates);

      const response = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coordinates),
      });

      const data = await response.json();

      console.log("Clock-in response:", data);

      if (!response.ok) {
        setMessage(
          `${data.error || "Clock-in failed."}${
            data.distance !== undefined
              ? ` Distance: ${data.distance}m.`
              : ""
          }${
            data.allowedRadius !== undefined
              ? ` Allowed radius: ${data.allowedRadius}m.`
              : ""
          }`
        );

        return;
      }

      setMessage("Clock-in successful!");

      setTodayAttendance(data.attendance);

      // Refresh history
      const historyResponse = await fetch("/api/attendance/history");

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();

        setHistory(
          historyData.attendances || historyData.attendance || []
        );
      }
    } catch (error) {
      console.error("Clock-in error:", error);

      if (error instanceof GeolocationPositionError) {
        setMessage("Unable to get your location.");
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * Clock out
   */
  const clockOut = async () => {
    setLoading(true);
    setMessage("");

    try {
      const coordinates = await getCurrentLocation();

      setLocation(coordinates);

      const response = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coordinates),
      });

      const data = await response.json();

      console.log("Clock-out response:", data);

      if (!response.ok) {
        setMessage(data.error || "Clock-out failed.");
        return;
      }

      const hours = Math.floor(data.durationMinutes / 60);
      const minutes = data.durationMinutes % 60;

      setMessage(`Clock-out successful! You worked ${hours}h ${minutes}m.`);

      setTodayAttendance(data.attendance);

      // Refresh history
      const historyResponse = await fetch("/api/attendance/history");

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();

        setHistory(
          historyData.attendances || historyData.attendance || []
        );
      }
    } catch (error) {
      console.error("Clock-out error:", error);

      if (error instanceof GeolocationPositionError) {
        setMessage("Unable to get your location.");
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * Logout
   */
  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setMessage("Logout failed.");
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Something went wrong while logging out.");
    }
  };

  /*
   * Format time
   */
  const formatTime = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /*
   * Format date
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * Determine today's status
   */
  const getStatus = () => {
    if (!todayAttendance) {
      return {
        label: "Not clocked in",
        className: "bg-slate-100 text-slate-600",
      };
    }

    if (!todayAttendance.clockOut) {
      return {
        label: "Currently working",
        className: "bg-green-100 text-green-700",
      };
    }

    return {
      label: "Completed",
      className: "bg-blue-100 text-blue-700",
    };
  };

  const status = getStatus();

  /*
   * Loading state
   */
  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/attendance"
            className="text-xl font-bold tracking-tight"
          >
            Attend<span className="text-blue-600">.</span>
          </Link>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Welcome */}
        <div>
          <p className="text-sm font-medium text-blue-600">
            Employee Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {user?.name} 👋
          </h1>

          <p className="mt-2 text-slate-600">
            Here's your attendance for today.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Today's Attendance */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Today's Attendance
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {new Date().toLocaleDateString([], {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {/* Clock in */}
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Clock in</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loadingAttendance
                    ? "..."
                    : formatTime(todayAttendance?.clockIn || null)}
                </p>
              </div>

              {/* Clock out */}
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Clock out</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {loadingAttendance
                    ? "..."
                    : formatTime(todayAttendance?.clockOut || null)}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!todayAttendance && (
                <button
                  onClick={clockIn}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Getting location..." : "Clock In"}
                </button>
              )}

              {todayAttendance && !todayAttendance.clockOut && (
                <button
                  onClick={clockOut}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Getting location..." : "Clock Out"}
                </button>
              )}

              {todayAttendance?.clockOut && (
                <div className="flex-1 rounded-lg bg-green-50 px-5 py-3 text-center font-semibold text-green-700">
                  Attendance completed for today
                </div>
              )}
            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Assigned Location
            </p>

            {user?.location ? (
              <>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">
                  {user.location.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {user.location.address}
                </p>

                <div className="mt-6 rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Attendance Radius
                  </p>

                  <p className="mt-1 text-lg font-bold text-blue-900">
                    {user.location.radius} metres
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-red-600">
                No location assigned to your account.
              </p>
            )}
          </section>
        </div>

        {/* Current Location */}
        {location && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Your Current Location
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Latitude</p>
                <p className="mt-1 font-mono text-sm text-slate-900">
                  {location.latitude}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Longitude</p>
                <p className="mt-1 font-mono text-sm text-slate-900">
                  {location.longitude}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* History */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-medium text-slate-500">
              Attendance History
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Recent attendance
            </h2>
          </div>

          {loadingHistory ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Loading attendance history...
            </div>
          ) : history.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No attendance records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Clock In</th>
                    <th className="px-6 py-4 font-medium">Clock Out</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {history.map((attendance) => (
                    <tr key={attendance.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatDate(attendance.clockIn)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatTime(attendance.clockIn)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatTime(attendance.clockOut)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {attendance.location?.name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

