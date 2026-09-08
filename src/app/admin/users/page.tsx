
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
    const [showForm, setShowForm] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [locationId, setLocationId] = useState("");

    const [creating, setCreating] = useState(false);
    const [formMessage, setFormMessage] = useState("");

    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editLocationId, setEditLocationId] = useState("");

    const [updating, setUpdating] = useState(false);
    const [editMessage, setEditMessage] = useState("");

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
                // Get employees
                const response = await fetch("/api/admin/users");
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Failed to load employees");
                    return;
                }

                setEmployees(data || []);

                // Get locations
                const locationsResponse = await fetch("/api/admin/locations");

                console.log("Locations response status:", locationsResponse.status);

                const locationsData = await locationsResponse.json();

                console.log("Locations data:", locationsData);

                if (!locationsResponse.ok) {
                    console.error(
                        "Failed to load locations:",
                        locationsData.error
                    );
                } else {
                    setLocations(locationsData.locations || []);
                }
            } catch (error) {
                console.error(error);
                setError("Something went wrong while loading employees.");
            } finally {
                setLoading(false);
            }
        };

        loadEmployees();
    }, [router]);


    const handleEditEmployee = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!editingEmployee) {
            return;
        }

        setUpdating(true);
        setEditMessage("");

        try {
            const response = await fetch(
                `/api/admin/users/${editingEmployee.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: editName,
                        email: editEmail,
                        locationId: editLocationId || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setEditMessage(
                    data.error || "Failed to update employee."
                );
                return;
            }

            setEmployees((currentEmployees) =>
                currentEmployees.map((employee) =>
                    employee.id === editingEmployee.id
                        ? data
                        : employee
                )
            );

            setEditingEmployee(null);
            setEditMessage("");
        } catch (error) {
            console.error(error);

            setEditMessage(
                "Something went wrong while updating the employee."
            );
        } finally {
            setUpdating(false);
        }
    };


    const startEditingEmployee = (employee: Employee) => {
        setEditingEmployee(employee);

        setEditName(employee.name);
        setEditEmail(employee.email);
        setEditLocationId(employee.location?.id || "");

        setEditMessage("");
    };



    const handleToggleStatus = async (
        employee: Employee
    ) => {
        const newStatus = !employee.isActive;

        try {
            const response = await fetch(
                `/api/admin/users/${employee.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isActive: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error || "Failed to update employee status."
                );
                return;
            }

            setEmployees((currentEmployees) =>
                currentEmployees.map((item) =>
                    item.id === employee.id
                        ? {
                            ...item,
                            isActive: data.isActive,
                        }
                        : item
                )
            );
        } catch (error) {
            console.error(error);
            setError(
                "Something went wrong while updating employee status."
            );
        }
    };




    const handleCreateEmployee = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setCreating(true);
        setFormMessage("");

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: "EMPLOYEE",
                    locationId: locationId || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setFormMessage(
                    data.error || "Failed to create employee."
                );
                return;
            }

            // Add the new employee to the table
            setEmployees((currentEmployees) => [
                data,
                ...currentEmployees,
            ]);

            // Reset form
            setName("");
            setEmail("");
            setPassword("");
            setLocationId("");

            setFormMessage("Employee created successfully.");
        } catch (error) {
            console.error(error);
            setFormMessage(
                "Something went wrong while creating the employee."
            );
        } finally {
            setCreating(false);
        }
    };




    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading employees...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 text-black">
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

                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Employees</h2>

                        <p className="mt-2 text-gray-500">
                            View and manage employee accounts.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setFormMessage("");
                        }}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        {showForm ? "Cancel" : "+ Add Employee"}
                    </button>
                </div>



                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}


                {showForm && (
                    <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold">
                                Add New Employee
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Create an employee account and assign their
                                attendance location.
                            </p>
                        </div>

                        <form
                            onSubmit={handleCreateEmployee}
                            className="space-y-5"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. john@example.com"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Temporary Password
                                    </label>

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter temporary password"
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Assigned Location
                                    </label>

                                    <select
                                        value={locationId}
                                        onChange={(e) => setLocationId(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
                                    >
                                        <option value="">
                                            Select a location
                                        </option>

                                        {locations.map((location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {formMessage && (
                                <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                                    {formMessage}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {editingEmployee && (
                    <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Edit Employee
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update employee information and assigned location.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingEmployee(null)}
                                className="text-sm text-gray-500 hover:text-black"
                            >
                                Cancel
                            </button>
                        </div>

                        <form
                            onSubmit={handleEditEmployee}
                            className="space-y-5"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Assigned Location
                                    </label>

                                    <select
                                        value={editLocationId}
                                        onChange={(e) =>
                                            setEditLocationId(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
                                    >
                                        <option value="">
                                            No location assigned
                                        </option>

                                        {locations.map((location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {editMessage && (
                                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {editMessage}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
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


                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Actions
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


                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditingEmployee(employee)}
                                                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>

                                                </div>
                                            </td>




                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(employee)}
                                                    className={`rounded-lg px-3 py-2 text-xs font-medium ${employee.isActive
                                                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                                                        : "border border-green-200 text-green-600 hover:bg-green-50"
                                                        }`}
                                                >
                                                    {employee.isActive ? "Deactivate" : "Activate"}
                                                </button>
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

