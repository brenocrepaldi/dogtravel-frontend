import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { WalkerAvatar } from './walker-avatar';

vi.mock('next/image', () => ({
	// `fill` is a next/image-only prop; drop it so it doesn't reach the DOM
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	default: ({ fill: _fill, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img alt={alt} {...props} />
	),
}));

describe('WalkerAvatar', () => {
	it('shows the photo when there is an avatar url', () => {
		render(<WalkerAvatar name="João Pedro Santos" avatarUrl="http://x/a.jpg" sizes="40px" />);

		expect(screen.getByRole('img', { name: 'João Pedro Santos' })).toBeInTheDocument();
	});

	it('falls back to initials when the photo fails to load', () => {
		render(<WalkerAvatar name="João Pedro Santos" avatarUrl="http://x/a.jpg" sizes="40px" />);

		fireEvent.error(screen.getByRole('img', { name: 'João Pedro Santos' }));

		expect(screen.queryByRole('img')).not.toBeInTheDocument();
		expect(screen.getByText('JP')).toBeInTheDocument();
	});

	it('shows initials when there is no avatar url', () => {
		render(<WalkerAvatar name="Julia Fernandes" avatarUrl={null} sizes="40px" />);

		expect(screen.getByText('JF')).toBeInTheDocument();
	});
});
