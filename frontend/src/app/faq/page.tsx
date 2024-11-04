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
            <h2 className="text-xl font-semibold mb-3">What is Brawl Pick?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Brawl Pick is a tool that helps Brawl Stars players make informed decisions about which brawlers to pick in different game modes.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h2 className="text-xl font-semibold mb-3">How are the statistics calculated?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our statistics are based on analysis of high-trophy matches and competitive play data, updated regularly to reflect the current meta.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h2 className="text-xl font-semibold mb-3">How often is the data updated?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The data is updated daily to ensure you have access to the most current meta information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 