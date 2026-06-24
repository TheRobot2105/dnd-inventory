import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { StashItemsTable } from './StashItemsTable';
import { Toaster } from '@/components/ui/sonner';
import { useStore } from '@/store';
import { wipeAll } from '@/db/wipe';
import { bootstrap } from '@/test/fixtures';

beforeEach(async () => {
  useStore.setState({ appState: null, log: [] });
  await wipeAll();
});

function setupWith(quantity: number): { stashId: string; itemInstanceId: string } {
  const { catalog, inventoryStashId } = bootstrap();
  const torch = catalog.find((d) => d.id === 'phb-2024:torch')!;
  useStore.getState().dispatch({
    type: 'acquire',
    payload: { stashId: inventoryStashId, definitionId: torch.id, quantity, source: 'catalog-add' },
  });
  const itemInstanceId = useStore.getState().appState!.items[0]!.id;
  return { stashId: inventoryStashId, itemInstanceId };
}

function renderTable(stashId: string): void {
  render(
    <MemoryRouter>
      <StashItemsTable stashId={stashId} />
      <Toaster />
    </MemoryRouter>,
  );
}

describe('StashItemsTable — M5 Move/Split buttons', () => {
  it('renders Split + Move buttons on each row', () => {
    const { stashId } = setupWith(3);
    renderTable(stashId);

    expect(screen.getByRole('button', { name: /^split torch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^move torch/i })).toBeInTheDocument();
  });

  it('disables Split when the row is a singleton', () => {
    const { stashId } = setupWith(1);
    renderTable(stashId);
    expect(screen.getByRole('button', { name: /^split torch/i })).toBeDisabled();
  });

  it('enables Split when the row has qty >= 2', () => {
    const { stashId } = setupWith(2);
    renderTable(stashId);
    expect(screen.getByRole('button', { name: /^split torch/i })).toBeEnabled();
  });

  it('opens the SplitModal when Split is clicked', async () => {
    const user = userEvent.setup();
    const { stashId } = setupWith(3);
    renderTable(stashId);

    await user.click(screen.getByRole('button', { name: /^split torch/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/split stack/i)).toBeInTheDocument();
  });

  it('opens the MoveItemModal when Move is clicked', async () => {
    const user = userEvent.setup();
    const { stashId } = setupWith(2);
    renderTable(stashId);

    await user.click(screen.getByRole('button', { name: /^move torch/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/move item/i)).toBeInTheDocument();
  });
});
