import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalkersFilterBar, type WalkersFilterProps } from './walkers-filter-bar';

function makeProps(overrides: Partial<WalkersFilterProps> = {}): WalkersFilterProps {
	return {
		inputQuery: '',
		onInputQueryChange: vi.fn(),
		sizeFilter: '',
		onSizeFilterChange: vi.fn(),
		onlyWithTrustPack: false,
		onOnlyWithTrustPackChange: vi.fn(),
		fitMyPets: false,
		onFitMyPetsChange: vi.fn(),
		hasActiveFilters: false,
		onClear: vi.fn(),
		...overrides,
	};
}

describe('WalkersFilterBar', () => {
	it('selects a size when its chip is tapped', async () => {
		const props = makeProps();
		render(<WalkersFilterBar {...props} />);

		await userEvent.click(screen.getByRole('button', { name: 'Grande' }));

		expect(props.onSizeFilterChange).toHaveBeenCalledWith('large');
	});

	it('marks only the active size chip as pressed', () => {
		render(<WalkersFilterBar {...makeProps({ sizeFilter: 'medium' })} />);

		expect(screen.getByRole('button', { name: 'Médio' })).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
	});

	it('toggles the trust pack chip off when it is on', async () => {
		const props = makeProps({ onlyWithTrustPack: true });
		render(<WalkersFilterBar {...props} />);

		await userEvent.click(screen.getByRole('button', { name: 'Pack de confiança' }));

		expect(props.onOnlyWithTrustPackChange).toHaveBeenCalledWith(false);
	});

	it('reports search input changes', async () => {
		const props = makeProps();
		render(<WalkersFilterBar {...props} />);

		await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar passeadores' }), 'a');

		expect(props.onInputQueryChange).toHaveBeenCalledWith('a');
	});
});
