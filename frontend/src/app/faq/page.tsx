import Link from 'next/link';

export default function FAQ() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Back to home
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h2 className="text-xl font-semibold mb-3">Question 1</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h2 className="text-xl font-semibold mb-3">Question 2</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h2 className="text-xl font-semibold mb-3">Question 3</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 