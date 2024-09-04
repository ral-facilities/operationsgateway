import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithProviders } from '../testUtils';
import ExportButton from './exportButton.component';

describe('ExportButton', () => {
  let user: ReturnType<typeof userEvent.setup>;

  it('opens and closes the dialog on button clicks', async () => {
    renderComponentWithProviders(<ExportButton />);

    user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
