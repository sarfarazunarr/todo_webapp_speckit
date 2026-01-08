import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold text-gray-800">
          Welcome to the <span className="text-indigo-600">Todo App!</span>
        </h1>

        <p className="mt-3 text-2xl text-gray-600">
          Your personal task management solution.
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <Link
            href="/signup"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-indigo-600 focus:text-indigo-600"
          >
            <h3 className="text-2xl font-bold">Sign Up &rarr;</h3>
            <p className="mt-4 text-xl">
              Create an account to start managing your tasks.
            </p>
          </Link>

          <Link
            href="/login"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-indigo-600 focus:text-indigo-600"
          >
            <h3 className="text-2xl font-bold">Login &rarr;</h3>
            <p className="mt-4 text-xl">
              Already have an account? Log in here.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
