import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import type { WalkerProfile } from '@/types';
import { WalkerCard } from './walker-card';

vi.mock('next/image', () => ({
	// `fill` is a next/image-only prop; drop it so it doesn't reach the DOM
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	default: ({ fill: _fill, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img alt={alt} {...props} />
	),
}));

const walker: WalkerProfile = {
	id: 'w1',
	name: 'João Pedro Santos',
	avatarUrl: 'http://localhost:9000/dogtravel/avatars/w1.jpg',
	rating: 4.8,
	reviews: 5,
	location: 'Barão Geraldo, Campinas',
	serviceArea: 'Campinas',
	description: 'Passeador certificado com 2 anos de experiência.',
	tags: ['pontual', 'atualiza em tempo real', 'fotos', 'relatório'],
	verified: true,
	availability: [],
	completedWalks: 5,
	joinedAt: '2026-01-01',
	trustChecks: { identityVerified: true, backgroundCheck: true },
	certifications: [],
	supportedSizes: ['small', 'medium'],
	behaviorExpertise: [],
};

describe('WalkerCard', () => {
	it('falls back to initials when the avatar image fails to load', () => {
		render(<WalkerCard walker={walker} index={0} />);

		fireEvent.error(screen.getByRole('img', { name: 'João Pedro Santos' }));

		expect(screen.getByText('JP')).toBeInTheDocument();
	});

	it('summarizes tags beyond the first three with a +n badge', () => {
		render(<WalkerCard walker={walker} index={0} />);

		expect(screen.getByText('+1')).toBeInTheDocument();
	});

	it('links the walker name to the profile and the button to scheduling', () => {
		render(<WalkerCard walker={walker} index={0} />);

		expect(screen.getByRole('link', { name: 'João Pedro Santos' })).toHaveAttribute('href', '/walkers/w1');
		expect(screen.getByRole('link', { name: 'Agendar passeio' })).toHaveAttribute('href', '/walks/new?walker=w1');
	});
});
