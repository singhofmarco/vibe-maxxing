import { SettingsClient } from "./settings-client";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string | string[]>>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await params;
  await searchParams;
  return <SettingsClient />;
}
