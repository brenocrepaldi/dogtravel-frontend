import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WalksClient } from './walks-client';

const refetch = vi.fn();

vi.mock('@/features/walks/hooks/use-walks', () => ({
	useWalks: () => ({ data: undefined, isLoading: false, isError: true, refetch }),
}));
vi.mock('@/features/walks/hooks/use-walk-actions', () => ({
	useCancelWalk: () => ({ mutate: vi.fn() }),
}));

describe('WalksClient', () => {
	it('shows a retry card instead of the empty state when loading fails', () => {
		render(<WalksClient />);

		expect(screen.queryByText('Você ainda não tem passeios')).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
		expect(refetch).toHaveBeenCalled();
	});
});
