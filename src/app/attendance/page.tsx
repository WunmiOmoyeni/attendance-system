"use client";

import { useState } from "react";

export default function AttendancePage() {
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const clockIn = () => {
        setLoading(true);
        setMessage("");

        if (!navigator.geolocation) {
            setMessage("Geolocation is not supported by this browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setLocation({
                    latitude,
                    longitude,
                });

                try {
                    const response = await fetch("/api/attendance/clock-in", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            latitude,
                            longitude,
                        }),
                    });

                    const data = await response.json();

                    console.log("Clock-in response:", data);

                    if (!response.ok) {
                        console.log("Clock-in error:", data);

                        setMessage(
                            `${data.error || "Clock-in failed."}${data.distance !== undefined
                                ? ` Distance: ${data.distance}m.`
                                : ""
                            }${data.allowedRadius !== undefined
                                ? ` Allowed radius: ${data.allowedRadius}m.`
                                : ""
                            }`
                        );

                        return;
                    }

                    setMessage("Clock-in successful!");
                } catch (error) {
                    console.error(error);
                    setMessage("Something went wrong.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error(error);

                setMessage("Unable to get your location.");
                setLoading(false);
            }
        );
    };

    const clockOut = () => {
        setLoading(true);
        setMessage("");

        if (!navigator.geolocation) {
            setMessage("Geolocation is not supported by this browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setLocation({
                    latitude,
                    longitude,
                });

                try {
                    const response = await fetch("/api/attendance/clock-out", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            latitude,
                            longitude,
                        }),
                    });

                    const data = await response.json();

                    console.log("Clock-out response:", data);

                    if (!response.ok) {
                        setMessage(data.error || "Clock-out failed.");
                        return;
                    }

                    setMessage(
                        `Clock-out successful! You worked ${Math.floor(
                            data.durationMinutes / 60
                        )}h ${data.durationMinutes % 60}m.`
                    );
                } catch (error) {
                    console.error(error);
                    setMessage("Something went wrong.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error(error);
                setMessage("Unable to get your location.");
                setLoading(false);
            }
        );
    };

    const getLocation = () => {
        setLoading(true);
        setMessage("");

        if (!navigator.geolocation) {
            setMessage("Geolocation is not supported by this browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setLocation({
                    latitude,
                    longitude,
                });

                setLoading(false);
            },
            (error) => {
                console.error(error);

                setMessage("Unable to get your location.");
                setLoading(false);
            }
        );
    };

    return (
        <main>
            <h1>Attendance</h1>

            <button onClick={clockIn} disabled={loading}>
                {loading ? "Getting location..." : "Clock In"}
            </button>

            <button onClick={clockOut} disabled={loading}>
                {loading ? "Getting location..." : "Clock Out"}
            </button>

            {location && (
                <div>
                    <p>Latitude: {location.latitude}</p>
                    <p>Longitude: {location.longitude}</p>
                </div>
            )}

            {message && <p>{message}</p>}
        </main>
    );
}