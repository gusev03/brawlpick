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
        
        <div className="divide-y divide-black/[.08] dark:divide-white/[.145]">
          <div className="py-6">
            <h2 className="text-xl font-semibold mb-3">Why isn&apos;t today&apos;s game map available?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The site updates every 12 hours. If a map hasn&apos;t been played since the last balance changes, it won&apos;t show until the site updates again.
            </p>
          </div>

          <div className="py-6">
            <h2 className="text-xl font-semibold mb-3">Will Solo Showdown, Duo Showdown, and Duels be added?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These modes may be added soon, but currently only 3v3 and 5v5 modes are available.
            </p>
          </div>

          <div className="py-6">
            <h2 className="text-xl font-semibold mb-3">How can I reach the creator?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Add and message <strong>@golemz</strong> on Discord.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 