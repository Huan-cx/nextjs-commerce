export function ActionsSkeleton() {
  return (
    <div className="flex max-w-fit gap-2 md:gap-4">
      <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="hidden h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700 lg:block" />
      <div className="hidden h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700 lg:block" />
    </div>
  );
}