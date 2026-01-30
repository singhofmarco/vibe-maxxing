import { ActionsClient } from "./actions-client";

export default async function ActionsPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string | string[]>>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await params;
  await searchParams;
  return <ActionsClient />;
}
