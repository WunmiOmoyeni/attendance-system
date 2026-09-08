
"use client";

import { useEffect, useState } from "react";

interface Attendance {
  id: string;
  clockIn: string;
  clockOut: string | null;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/admin/attendance");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch attendance");
        }

        setAttendance(data.attendance);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance History
        </h1>

        <div className="mt-6 rounded-xl border bg-white p-8 text-center">
          <p className="text-gray-500">
            Loading attendance history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance History
        </h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance History
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View your previous attendance records.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Attendance
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {attendance.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Completed Days
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {attendance.filter((record) => record.clockOut).length}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {attendance.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-medium text-gray-900">
              No attendance records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your attendance history will appear here once you
              clock in.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-600">
                    Date
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-600">
                    Clock In
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-600">
                    Clock Out
                  </th>

                  <th className="px-6 py-4 font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {attendance.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatDate(record.clockIn)}
                    </td>

                    {/* Clock In */}
                    <td className="px-6 py-4 text-gray-600">
                      {formatTime(record.clockIn)}
                    </td>

                    {/* Clock Out */}
                    <td className="px-6 py-4 text-gray-600">
                      {record.clockOut
                        ? formatTime(record.clockOut)
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {record.clockOut ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

