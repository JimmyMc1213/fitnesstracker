import { AuditTable } from "../../../components/AuditTable";
import { DemoBanner } from "../../../components/DemoBanner";
import { getAuditLog } from "../../../lib/audit";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const { data, demo } = await getAuditLog(200);
  return (
    <>
      <DemoBanner show={demo} />
      <AuditTable entries={data} />
    </>
  );
}
