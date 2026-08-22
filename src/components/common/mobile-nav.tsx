'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
	children: React.ReactNode;
	className?: string;
}

export function MobileNav({ children, className }: MobileNavProps) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resets the drawer's open state on route change, not a state-synchronization anti-pattern.
		setOpen(false);
	}, [pathname]);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className={cn('lg:hidden', className)}
						aria-label="Abrir menu"
					/>
				}
			>
				<Menu className="h-5 w-5" />
			</SheetTrigger>
			<SheetContent side="left" className="w-72 p-0">
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-between p-4 border-b">
						<h2 className="text-lg font-semibold">Menu</h2>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => setOpen(false)}
							aria-label="Fechar menu"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
					<nav className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</nav>
				</div>
			</SheetContent>
		</Sheet>
	);
}
