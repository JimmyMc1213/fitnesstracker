import { IntegrationsPanel } from "../../../components/IntegrationsPanel";
import { listProviderStates } from "../../../lib/integrations/store";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const states = await listProviderStates();
  return <IntegrationsPanel states={states} />;
}
