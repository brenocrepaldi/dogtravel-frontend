import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WalkerWalksClient } from './walker-walks-client';

const refetch = vi.fn();

vi.mock('next-auth/react', () => ({
	useSession: () => ({ data: { user: { id: 'w1' } } }),
}));
vi.mock('@/features/walks/hooks/use-walks', () => ({
	useWalks: () => ({ data: undefined, isLoading: false, isError: true, refetch }),
}));

describe('WalkerWalksClient', () => {
	it('shows a retry card instead of the empty state when loading fails', () => {
		render(<WalkerWalksClient />);

		expect(screen.queryByText('Nenhum passeio por aqui')).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
		expect(refetch).toHaveBeenCalled();
	});
});
