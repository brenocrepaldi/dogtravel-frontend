import { LoadingState } from "@/components/common/loading-state";

export default function DashboardLoading() {
  return <LoadingState variant="section" text="Carregando..." className="min-h-[50vh]" />;
}
