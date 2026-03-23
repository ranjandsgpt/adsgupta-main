"use client";

export default function TalentosError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <p className="text-white text-lg font-semibold">Something went wrong. Please try again.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium"
      >
        Refresh
      </button>
    </div>
  );
}
