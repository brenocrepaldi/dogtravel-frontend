import { describe, expect, it } from 'vitest';
import { TRACKING_STATUS } from './tracking-status';

describe('TRACKING_STATUS', () => {
  it('marks only an in-progress walk as live', () => {
    expect(TRACKING_STATUS.in_progress).toMatchObject({ label: 'Em andamento', live: true });
    expect(TRACKING_STATUS.accepted).toMatchObject({ label: 'Aguardando início', live: false });
    expect(TRACKING_STATUS.completed).toMatchObject({ label: 'Concluído', live: false });
    expect(TRACKING_STATUS.pending).toMatchObject({ label: 'Aguardando passeador', live: false });
    expect(TRACKING_STATUS.cancelled).toMatchObject({ label: 'Cancelado', live: false });
  });
});
