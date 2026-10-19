import { Skeleton } from '@/components/ui/skeleton';

export default function WalkerDetailLoading() {
	return (
		<div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-10" aria-busy="true">
			{/* Back link: 44px tall on mobile, 28px from md */}
			<Skeleton className="my-3 h-5 w-40 md:my-1" />

			<div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
				<div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
					{/* Hero */}
					<div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 md:p-6">
						<div className="flex items-center gap-4 md:gap-6">
							<Skeleton className="h-16 w-16 shrink-0 rounded-2xl md:h-20 md:w-20" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-3 w-28" />
							</div>
						</div>
						<div className="mt-4 space-y-2">
							<Skeleton className="h-3.5 w-full" />
							<Skeleton className="h-3.5 w-3/4" />
						</div>
					</div>

					{/* Stats + sections */}
					<Skeleton className="h-28 rounded-xl md:h-20" />
					<Skeleton className="h-40 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
				</div>

				{/* Sidebar (md+) */}
				<Skeleton className="hidden h-96 w-full shrink-0 rounded-xl md:block lg:w-80" />
			</div>
		</div>
	);
}
