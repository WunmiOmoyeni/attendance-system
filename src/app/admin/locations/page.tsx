
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const LocationMap = dynamic(
    () => import("@/src/components/LocationMap"),
    {
        ssr: false,
        loading: () => (
            <div className="h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Loading map...</p>
            </div>
        ),
    }
);

type Location = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
    _count: {
        users: number;
        attendances: number;
    };
};

export default function AdminLocationsPage() {
    const router = useRouter();

    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState(6.5244);
    const [longitude, setLongitude] = useState(3.3792);
    const [radius, setRadius] = useState(100);

    const [saving, setSaving] = useState(false);
    const [formMessage, setFormMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<
        {
            display_name: string;
            lat: string;
            lon: string;
        }[]
    >([]);

    useEffect(() => {
        const loadLocations = async () => {
            try {
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

                const response = await fetch("/api/admin/locations");
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Failed to load locations");
                    return;
                }

                setLocations(data.locations || []);
            } catch (error) {
                console.error(error);
                setError("Something went wrong while loading locations.");
            } finally {
                setLoading(false);
            }
        };

        loadLocations();
    }, [router]);

    const handleLocationChange = (
        newLatitude: number,
        newLongitude: number
    ) => {
        setLatitude(newLatitude);
        setLongitude(newLongitude);
    };

    const handleCreateLocation = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setSaving(true);
        setFormMessage("");

        try {
            const response = await fetch("/api/admin/locations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    address,
                    latitude,
                    longitude,
                    radius,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setFormMessage(data.error || "Failed to create location");
                return;
            }

            // Add the newly created location to the table
            setLocations((current) => [
                {
                    ...data,
                    _count: {
                        users: 0,
                        attendances: 0,
                    },
                },
                ...current,
            ]);

            // Reset form
            setName("");
            setAddress("");
            setLatitude(6.5244);
            setLongitude(3.3792);
            setRadius(100);

            setFormMessage("Location created successfully!");
        } catch (error) {
            console.error(error);
            setFormMessage("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleSearchAddress = async () => {
        if (!searchQuery.trim()) {
            return;
        }

        try {
            setSearching(true);
            setSearchResults([]);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(searchQuery
                )}`
            );
            if (!response.ok) {
                throw new Error("Failed to search for address");
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Address search error:", error);
        } finally {
            setSearching(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading locations...</p>
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
                        <p className="text-sm text-gray-500">
                            Location Management
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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Locations</h2>

                        <p className="mt-2 text-gray-500">
                            Manage the locations where employees can clock in.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setShowForm((current) => !current);
                            setFormMessage("");
                        }}
                        className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        {showForm ? "Cancel" : "+ Add Location"}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Add Location Form */}
                {showForm && (
                    <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold">
                                Add Attendance Location
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Enter the location details and click the map to select
                                the exact attendance point.
                            </p>
                        </div>

                        <form onSubmit={handleCreateLocation}>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Location Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Location Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="e.g. Ikeja Office"
                                        required
                                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(event) =>
                                            setAddress(event.target.value)
                                        }
                                        placeholder="e.g. 12 Allen Avenue, Ikeja"
                                        required
                                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Search for location
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="e.g. 12 Allen Avenue, Ikeja"
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                    />
                                    <button type="button"
                                        onClick={handleSearchAddress}
                                        disabled={searching}
                                        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                                    >
                                        {searching ? "Searching..." : "Search"}
                                    </button>
                                </div>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="mb-4 overflow-hidden rounded-md border border-gray-200">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={`${result.lat}-${result.lon}-${index}`}
                                            type="button"
                                            onClick={() => {
                                                const lat = Number(result.lat);
                                                const lon = Number(result.lon);

                                                setLatitude(lat);
                                                setLongitude(lon);
                                                setAddress(result.display_name);

                                                setSearchResults([]);
                                                setSearchQuery(result.display_name);
                                            }}
                                            className="block w-full border-b border-gray-100 px-3 py-3 text-left text-sm hover:bg-gray-50 last:border-b-0"
                                        >
                                            {result.display_name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Map */}
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium">
                                    Select Location on Map
                                </label>

                                <LocationMap
                                    latitude={latitude}
                                    longitude={longitude}
                                    onLocationChange={handleLocationChange}
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    Click anywhere on the map to move the location marker.
                                </p>
                            </div>

                            {/* Coordinates */}
                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Latitude
                                    </label>

                                    <input
                                        type="number"
                                        value={latitude}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Longitude
                                    </label>

                                    <input
                                        type="number"
                                        value={longitude}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Radius */}
                            <div className="mt-6 max-w-md">
                                <label className="mb-2 block text-sm font-medium">
                                    Attendance Radius (metres)
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={radius}
                                    onChange={(event) =>
                                        setRadius(Number(event.target.value))
                                    }
                                    required
                                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    Employees must be within this distance of the selected
                                    point to clock in.
                                </p>
                            </div>

                            {formMessage && (
                                <div className="mt-6 rounded-lg bg-gray-50 border px-4 py-3 text-sm">
                                    {formMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? "Creating..." : "Create Location"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Location list */}
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    {locations.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500">No locations found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Location
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Address
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Coordinates
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Radius
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Employees
                                        </th>

                                        <th className="px-6 py-4 text-sm font-semibold">
                                            Attendance
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {locations.map((location) => (
                                        <tr
                                            key={location.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium">{location.name}</p>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {location.address}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <p>Lat: {location.latitude}</p>
                                                <p>Lng: {location.longitude}</p>
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                {location.radius}m
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                {location._count.users}
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                {location._count.attendances}
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

