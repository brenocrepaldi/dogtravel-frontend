'use client';

import { useSession } from 'next-auth/react';
import { WalksClient } from './walks-client';
import { WalkerWalksClient } from './walker-walks-client';

export function WalksRouter() {
	const { data: session } = useSession();
	if (session?.user?.role === 'walker') {
		return <WalkerWalksClient />;
	}
	return <WalksClient />;
}
