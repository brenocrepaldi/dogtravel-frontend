import { RequestDetailClient } from './_components/request-detail-client';

export default async function WalkRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetailClient requestId={id} />;
}
