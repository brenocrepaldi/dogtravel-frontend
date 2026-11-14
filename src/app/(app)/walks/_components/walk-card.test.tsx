import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WalkRecord } from '@/types';
import { WalkCard } from './walk-card';

const openMutate = vi.fn();
vi.mock('@/features/walks/hooks/use-walk-actions', () => ({
	useOpenWalk: () => ({ mutate: openMutate, isPending: false }),
}));

function pendingWalk(overrides: Partial<WalkRecord>): WalkRecord {
	return {
		id: 'walk-1',
		status: 'pending',
		dateLabel: 'Hoje, 15:24',
		petNames: ['Rex'],
		durationMinutes: 45,
		startAddress: 'Alameda dos Pinheiros',
		price: 25.92,
		participants: [],
		walkerId: null,
		walkerName: null,
		walkerAvatarUrl: null,
		requestMode: 'open',
		...overrides,
	} as WalkRecord;
}

describe('WalkCard (pending request)', () => {
	it('says it is searching when the request is open to every walker', () => {
		render(<WalkCard walk={pendingWalk({})} onCancel={vi.fn()} />);

		expect(screen.getByText('Procurando passeador')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Cancelar busca/ })).toBeInTheDocument();
	});

	it('shows the chosen walker while waiting on them', () => {
		render(
			<WalkCard
				walk={pendingWalk({ requestMode: 'directed', walkerId: 'w1', walkerName: 'João Pedro Santos' })}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.queryByText('Procurando passeador')).toBeNull();
		expect(screen.getByText('João Pedro Santos')).toBeInTheDocument();
		expect(screen.getByText('Aguardando')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Detalhes' })).toHaveAttribute('href', '/walks/walk-1');
	});

	it('lets the client open a declined request to every walker', async () => {
		render(
			<WalkCard
				walk={pendingWalk({ requestMode: 'declined', walkerId: 'w1', walkerName: 'João Pedro Santos' })}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByText('Recusado')).toBeInTheDocument();
		expect(screen.getByText(/João não pode fazer este passeio/)).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /Abrir para todos/ }));
		expect(openMutate).toHaveBeenCalledWith('walk-1', expect.any(Object));
	});
});
