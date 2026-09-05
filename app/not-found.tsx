import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        The page or API endpoint you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
