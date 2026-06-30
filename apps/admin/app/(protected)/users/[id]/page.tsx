import Link from "next/link";
import { notFound } from "next/navigation";

import { UserDetail } from "../../../../components/UserDetail";
import { DemoBanner } from "../../../../components/DemoBanner";
import { getUserDetail, getUserLatestFutureYou } from "../../../../lib/data";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data, demo }, futureYou] = await Promise.all([getUserDetail(id), getUserLatestFutureYou(id)]);

  if (!data) notFound();

  return (
    <>
      <DemoBanner show={demo} />
      <UserDetail detail={data} futureYou={futureYou} />
    </>
  );
}
