
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Attend<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="w-full text-center">
            <div className="mx-auto max-w-3xl">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                Smart Attendance Management
              </span>

              <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Attendance made
                <span className="block text-blue-600">simple.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                A simple and secure way to manage employee attendance using
                location-based verification. Clock in, clock out, and keep
                accurate attendance records with ease.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="w-full rounded-lg bg-blue-600 px-7 py-3.5 text-center font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Get Started
                </Link>

                <a
                  href="#features"
                  className="w-full rounded-lg border border-slate-300 bg-white px-7 py-3.5 text-center font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-slate-200 bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Built for simplicity
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage attendance
            </h2>

            <p className="mt-4 text-lg text-slate-600">
              Keep attendance tracking straightforward, accurate, and secure.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                📍
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                Location Verification
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Employees can only clock in and out when they are within their
                assigned attendance location.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🕐
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                Accurate Time Tracking
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Record clock-in and clock-out times automatically and keep
                track of how long employees work.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🔒
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                Secure Access
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Secure authentication and role-based access keep employee and
                administrative information protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to get started?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-blue-100">
            Log in to your account and start managing attendance.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex rounded-lg bg-white px-7 py-3.5 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Login to your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Attend. All rights reserved.
          </p>

          <p>Smart attendance management.</p>
        </div>
      </footer>
    </main>
  );
}
