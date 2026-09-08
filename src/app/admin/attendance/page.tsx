
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Attendance = {
    id: string;
    clockIn: string;
    clockOut: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
    location: {
        id: string;
        name: string;
        address: string;
    } | null;
};

export default function AdminAttendancePage() {
    const router = useRouter();

    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        const loadAttendance = async () => {
            try {
                // Check authentication
                const meResponse = await fetch("/api/auth/me");

                if (!meResponse.ok) {
                    router.replace("/login");
                    return;
                }

                const meData = await meResponse.json();

                // Check admin role
                if (meData.user.role !== "ADMIN") {
                    router.replace("/attendance");
                    return;
                }

                // Fetch attendance records
                const response = await fetch("/api/admin/attendance");
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Failed to load attendance");
                    return;
                }

                setAttendance(data.attendance || []);
            } catch (error) {
                console.error("Attendance loading error:", error);
                setError(
                    "Something went wrong while loading attendance records."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, [router]);

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Format time
    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("en-NG", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Convert date to YYYY-MM-DD for filtering
    const getDateValue = (date: string) => {
        const parsedDate = new Date(date);

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // Filter attendance
    const filteredAttendance = useMemo(() => {
        return attendance.filter((record) => {
            const search = searchQuery.toLowerCase().trim();

            const matchesSearch =
                !search ||
                record.user.name.toLowerCase().includes(search) ||
                record.user.email.toLowerCase().includes(search);

            const matchesDate =
                !selectedDate ||
                getDateValue(record.clockIn) === selectedDate;

            return matchesSearch && matchesDate;
        });
    }, [attendance, searchQuery, selectedDate]);

    // Clear filters
    const clearFilters = () => {
        setSearchQuery("");
        setSelectedDate("");
    };

    // Summary values
    const totalRecords = attendance.length;

    const currentlyClockedIn = attendance.filter(
        (record) => !record.clockOut
    ).length;

    const completedRecords = attendance.filter(
        (record) => record.clockOut
    ).length;

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">
                    Loading attendance records...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 text-black">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Attend.
                        </h1>

                        <p className="text-sm text-black">
                            Attendance Management
                        </p>
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
                {/* Page heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">
                        Employee Attendance
                    </h2>

                    <p className="mt-2 text-gray-500">
                        View and monitor attendance records for all employees.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Records */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Records
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {totalRecords}
                        </p>
                    </div>

                    {/* Currently Clocked In */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Currently Clocked In
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {currentlyClockedIn}
                        </p>
                    </div>

                    {/* Completed */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Completed
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {completedRecords}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium">
                                Search Employee
                            </label>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search by name or email..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Date */}
                        <div className="w-full md:w-64">
                            <label className="mb-2 block text-sm font-medium">
                                Filter by Date
                            </label>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(event) =>
                                    setSelectedDate(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Clear */}
                        {(searchQuery || selectedDate) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-100"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Filter result count */}
                    {(searchQuery || selectedDate) && (
                        <p className="mt-4 text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-black">
                                {filteredAttendance.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-black">
                                {attendance.length}
                            </span>{" "}
                            records
                        </p>
                    )}
                </div>

                {/* Attendance Table */}
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    {filteredAttendance.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <h3 className="text-lg font-semibold">
                                No attendance records found
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                {attendance.length === 0
                                    ? "Employee attendance records will appear here."
                                    : "Try adjusting your search or date filter."}
                            </p>

                            {(searchQuery || selectedDate) && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                >
                                    Clear Filters
                                </button>
                            )}
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
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Clock In
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Clock Out
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Location
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {filteredAttendance.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-gray-50"
                                        >
                                            {/* Employee */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {record.user.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {record.user.email}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(record.clockIn)}
                                            </td>

                                            {/* Clock In */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatTime(record.clockIn)}
                                            </td>

                                            {/* Clock Out */}
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {record.clockOut
                                                    ? formatTime(record.clockOut)
                                                    : "—"}
                                            </td>

                                            {/* Location */}
                                            <td className="px-6 py-4">
                                                {record.location ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {record.location.name}
                                                        </p>

                                                        <p className="mt-1 max-w-xs text-xs text-gray-500">
                                                            {record.location.address}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {record.clockOut ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                                        Clocked In
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
            </section>
        </main>
    );
}

