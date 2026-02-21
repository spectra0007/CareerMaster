import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <header className="px-8 py-4 bg-white shadow-sm flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600">CareerMaster</div>
        <nav className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Sign up
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Level up your <span className="text-blue-600">engineering career</span>.
        </h1>
        <p className="max-w-2xl text-xl text-gray-500 mb-10">
          The all-in-one platform for coding interviews, system design prep, and curated guest lectures from industry professionals.
        </p>

        <div className="flex gap-4">
          <SignedOut>
            <Link
              href="/sign-up"
              className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Get Started for Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 text-base font-medium text-blue-600 bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              View Pricing
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
