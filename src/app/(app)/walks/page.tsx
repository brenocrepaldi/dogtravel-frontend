import type { Metadata } from 'next';
import { WalksRouter } from './_components/walks-router';

export const metadata: Metadata = { title: 'Meus Passeios | DogTravel' };

export default function WalksPage() {
	return <WalksRouter />;
}
