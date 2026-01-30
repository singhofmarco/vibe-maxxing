import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string | string[]>>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await params;
  await searchParams;
  return <DashboardClient />;
}
