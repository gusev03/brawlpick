import Image from "next/image";

export default function GemGrab() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/gem_grab_icon.png"
            alt="Gem Grab icon"
            width={40}
            height={40}
          />
          <h1 className="text-3xl font-bold">Gem Grab Statistics</h1>
        </div>
        <div className="grid gap-6">
          <div className="p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h2 className="text-xl font-semibold mb-4">Top Brawlers</h2>
            <p>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
