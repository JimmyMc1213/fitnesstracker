import { IssuesTable } from "../../../components/IssuesTable";
import { DemoBanner } from "../../../components/DemoBanner";
import { getIssues } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const { data, demo } = await getIssues();
  return (
    <>
      <DemoBanner show={demo} />
      <IssuesTable issues={data} />
    </>
  );
}
