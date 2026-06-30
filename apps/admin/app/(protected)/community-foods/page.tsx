import { FoodsTable } from "../../../components/FoodsTable";
import { DemoBanner } from "../../../components/DemoBanner";
import { getFoods } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function CommunityFoodsPage() {
  const { data, demo } = await getFoods();
  return (
    <>
      <DemoBanner show={demo} />
      <FoodsTable foods={data} />
    </>
  );
}
