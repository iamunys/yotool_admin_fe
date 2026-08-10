import Link from "next/link";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-sm font-semibold text-ink">User detail is coming soon.</p>
      <p className="mt-1 text-xs text-muted">User ID: {id}</p>
      <Link href="/users" className="dash-btn-secondary mt-6 inline-flex min-h-10">Back to Users</Link>
    </div>
  );
}
