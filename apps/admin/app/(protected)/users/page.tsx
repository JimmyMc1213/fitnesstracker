import { UsersTable } from "../../../components/UsersTable";
import { DemoBanner } from "../../../components/DemoBanner";
import { getUsers } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { data, demo } = await getUsers();

  return (
    <>
      <DemoBanner show={demo} />
      <UsersTable rows={data} initialQuery={q ?? ""} />
    </>
  );
}
