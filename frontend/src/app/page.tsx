import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Brawl Pick
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated November 3rd, 2024
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/brawlball"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7"
          >
            <Image
              src="/brawl_ball_icon.png"
              alt="Brawl Ball icon"
              width={28}
              height={28}
              className="mr-3"
            />
            Brawl Ball
          </Link>
          <Link
            href="/gemgrab"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7"
          >
            <Image
              src="/gem_grab_icon.png"
              alt="Gem Grab icon"
              width={28}
              height={28}
              className="mr-3"
            />
            Gem Grab
          </Link>
          <Link
            href="/heist"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7"
          >
            <Image
              src="/heist_icon.png"
              alt="Heist icon"
              width={28}
              height={28}
              className="mr-3"
            />
            Heist
          </Link>
          <Link
            href="/knockout"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7"
          >
            <Image
              src="/knock_out_icon.png"
              alt="Knock Out icon"
              width={28}
              height={28}
              className="mr-3"
            />
            Knock Out
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex items-center justify-center gap-4">
        <Link
          href="/faq"
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          FAQ
        </Link>
        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          href="https://github.com/gusev03/brawlpick"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className="dark:invert mr-2"
            src="/github-mark.svg"
            alt="GitHub logo"
            width={20}
            height={20}
          />
          Git repo
        </a>
      </footer>
    </div>
  );
}
