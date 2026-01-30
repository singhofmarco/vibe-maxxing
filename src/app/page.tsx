export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Vibe Maxxing
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          A personal assistant that turns your thoughts into actionable items.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Boilerplate ready: Next.js (App Router, Server Actions), Anthropic, Firebase, Supabase.
        </p>
      </main>
    </div>
  );
}
