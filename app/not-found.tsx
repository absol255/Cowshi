export default function NotFound() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-10 text-center">
      <h1 className="text-2xl font-semibold">Market not found</h1>
      <p className="mt-2 text-muted">That ticker is not on the Cowshi book.</p>
    </div>
  );
}
