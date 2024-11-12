import { renderComponentWithProviders } from '../../testUtils';
import UsersTable from './usersTable.component'; // Update with the correct path

describe('UsersTable Snapshot', () => {
  it('matches snapshot', () => {
    const { asFragment } = renderComponentWithProviders(<UsersTable />);
    expect(asFragment()).toMatchSnapshot();
  });
});
