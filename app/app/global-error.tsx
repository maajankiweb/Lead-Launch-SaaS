"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-destructive">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {error?.message || "An unexpected error occurred."}
        </p>
        {reset && (
          <button
            onClick={() => reset()}
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 cursor-pointer"
          >
            Try Again
          </button>
        )}
      </body>
    </html>
  );
}
