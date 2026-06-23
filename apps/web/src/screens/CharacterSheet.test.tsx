import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { CharacterSheet } from './CharacterSheet';
import { Welcome } from './Welcome';
import { useStore } from '@/store';
import { wipeAll } from '@/db/wipe';

beforeEach(async () => {
  useStore.setState({ appState: null, log: [] });
  await wipeAll();
});

/**
 * Component test for the M1 happy path: after dispatching create-character,
 * CharacterSheet renders the header from the store. Uses a memory router
 * pinned at /character/:id so we don't depend on jsdom history globals.
 */
function renderAt(path: string): void {
  const router = createMemoryRouter(
    [
      { path: '/', Component: Welcome },
      { path: '/character/:id', Component: CharacterSheet },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

describe('CharacterSheet (M1)', () => {
  it('renders the character header after create-character', () => {
    useStore.getState().dispatch({
      type: 'create-character',
      payload: { name: 'Thorin', species: 'Dwarf', class: 'Fighter', level: 3, str: 16 },
    });
    const id = useStore.getState().appState!.characters[0]!.id;

    renderAt(`/character/${id}`);

    expect(screen.getByRole('heading', { name: 'Thorin' })).toBeInTheDocument();
    expect(screen.getByText(/Level 3 Dwarf Fighter/)).toBeInTheDocument();
    expect(screen.getByText(/STR 16/)).toBeInTheDocument();
  });

  it('renders all four tabs', () => {
    useStore.getState().dispatch({
      type: 'create-character',
      payload: { name: 'A', species: 'B', class: 'C', level: 1, str: 10 },
    });
    const id = useStore.getState().appState!.characters[0]!.id;

    renderAt(`/character/${id}`);

    expect(screen.getByRole('tab', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Storage' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Party Stash' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Recovered Loot' })).toBeInTheDocument();
  });

  it('redirects to / when the character id is unknown', () => {
    renderAt('/character/does-not-exist');
    // Welcome renders an h1 with that text; CharacterSheet renders the character name.
    expect(screen.getByRole('heading', { name: /welcome, adventurer/i })).toBeInTheDocument();
  });
});
