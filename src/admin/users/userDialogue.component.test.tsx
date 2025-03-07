import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MockInstance } from 'vitest';
import { ogApi } from '../../api/api';
import UsersJson from '../../mocks/users.json';
import { renderComponentWithProviders } from '../../testUtils';
import UserDialogue, { UserDialogueProps } from './userDialogue.component';

describe('userDialogue', () => {
  let props: UserDialogueProps;
  let user: UserEvent;

  const onClose = vi.fn();
  const createView = () => {
    return renderComponentWithProviders(<UserDialogue {...props} />);
  };

  beforeEach(() => {
    props = { onClose: onClose, open: true, requestType: 'post' };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('add dialog', () => {
    let axiosPostSpy: MockInstance;

    beforeEach(() => {
      axiosPostSpy = vi.spyOn(ogApi, 'post');
    });
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders the component correctly', async () => {
      createView();
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('displays required error when username is empty', async () => {
      createView();
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      expect(
        await screen.findByText('Username is required.')
      ).toBeInTheDocument();
    });

    it('displays password field only when auth_type is "local"', async () => {
      createView();

      await user.type(screen.getByLabelText('Username'), 'new_user');
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('does not display password field only when auth_type is "FedID"', async () => {
      createView();
      await user.type(screen.getByLabelText('Username'), 'new_user');
      const [authType, _routes] = screen.getAllByRole('combobox');
      await user.click(authType);
      await user.click(await screen.findByText('FedID'));
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    });

    it('adds user successfully (local)', async () => {
      createView();

      await user.type(screen.getByLabelText('Username'), 'new_user');
      await user.type(screen.getByLabelText('Password'), 'secure_password');

      const [_authType, routes] = screen.getAllByRole('combobox');

      await user.click(routes);
      await user.click(await screen.findByText('/submit/hdf POST'));
      await user.click(routes);
      await user.click(await screen.findByText('/users PATCH'));

      await user.click(screen.getByText('Submit'));

      expect(axiosPostSpy).toHaveBeenCalledWith('/users', {
        _id: 'new_user',
        auth_type: 'local',
        authorised_routes: ['/submit/hdf POST', '/users PATCH'],
        sha256_password: 'secure_password',
      });
    });

    it('adds user successfully (fedId)', async () => {
      createView();

      await user.type(screen.getByLabelText('Username'), 'new_user');

      const [authType, _routes] = screen.getAllByRole('combobox');

      await user.click(authType);
      await user.click(await screen.findByText('FedID'));

      await user.click(screen.getByText('Submit'));

      expect(axiosPostSpy).toHaveBeenCalledWith('/users', {
        _id: 'new_user',
        auth_type: 'FedID',
      });
    });

    it('adds user successfully (fedId) switch from local to fedId', async () => {
      // This tests that the password is removed if you switch from local to fedId
      createView();

      await user.type(screen.getByLabelText('Username'), 'new_user');
      await user.type(screen.getByLabelText('Password'), 'secure_password');

      const [authType, _routes] = screen.getAllByRole('combobox');

      await user.click(authType);
      await user.click(await screen.findByText('FedID'));

      await user.click(screen.getByText('Submit'));

      expect(axiosPostSpy).toHaveBeenCalledWith('/users', {
        _id: 'new_user',
        auth_type: 'FedID',
      });
    });

    it('displays error when adding a user without a password for "local" auth_type', async () => {
      createView();
      await user.type(screen.getByLabelText('Username'), 'local_user');
      await user.click(screen.getByText('Submit'));
      expect(
        await screen.findByText(
          'for the auth_type you put (local), a password is required. Please add this field'
        )
      ).toBeInTheDocument();
    });

    it('displays error for duplicate username', async () => {
      createView();

      await user.type(screen.getByLabelText('Username'), 'test_dup');
      await user.type(screen.getByLabelText('Password'), 'secure_password');
      await user.click(screen.getByText('Submit'));

      expect(
        await screen.findByText(
          'username field must not be the same as a pre existing user. You put: test_dup'
        )
      ).toBeInTheDocument();
    });

    it('displays general error for unknown issues', async () => {
      createView();

      await user.type(screen.getByLabelText('Username'), 'error');
      await user.type(screen.getByLabelText('Password'), 'secure_password');
      await user.click(screen.getByText('Submit'));

      expect(
        await screen.findByText(
          'An unexpected error occurred. Please try again later.'
        )
      ).toBeInTheDocument();
    });

    it('should show and hide password when clicking the visibility toggle', async () => {
      createView();

      await user.type(screen.getByLabelText('Username'), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'secure_password');

      const passwordField = screen.getByLabelText('Password');
      expect(passwordField).toHaveAttribute('type', 'password');

      const visibilityIcon = screen.getByLabelText('Show password');
      await user.click(visibilityIcon);

      expect(passwordField).toHaveAttribute('type', 'text');

      const hideVisibilityIcon = screen.getByLabelText('Hide password');
      await user.click(hideVisibilityIcon);

      expect(passwordField).toHaveAttribute('type', 'password');
    });
  });
  describe('change password', () => {
    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      props.passwordOnly = true;
      props.selectedUser = UsersJson[0];
      props.requestType = 'patch';
      axiosPatchSpy = vi.spyOn(ogApi, 'patch');
    });
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders the component correctly', async () => {
      createView();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('displays error when no password is supplied', async () => {
      createView();
      await user.click(screen.getByText('Submit'));
      expect(
        await screen.findByText(
          'Password field is empty. Please enter a new password or close the dialog.'
        )
      ).toBeInTheDocument();
    });

    it('changes password successfully', async () => {
      createView();

      await user.type(screen.getByLabelText('Password'), 'secure_password');

      await user.click(screen.getByText('Submit'));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/users', {
        _id: 'user1',
        updated_password: 'secure_password',
      });
    });
  });
  describe('modify authorised routes', () => {
    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      props.authorisedRoutesOnly = true;
      props.selectedUser = UsersJson[0];
      props.requestType = 'patch';
      axiosPatchSpy = vi.spyOn(ogApi, 'patch');
    });
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders the component correctly', async () => {
      createView();
      expect(screen.getByText('Modify Authorised Routes')).toBeInTheDocument();
    });

    it('displays error when no routes are changed', async () => {
      createView();
      await user.click(screen.getByText('Submit'));
      expect(
        await screen.findByText(
          'Please modify the routes; these routes have not been edited.'
        )
      ).toBeInTheDocument();
    });

    it('modify authorised routes successfully', async () => {
      createView();

      const routes = screen.getByRole('combobox');

      await user.click(routes);
      await user.click(
        await screen.findByRole('option', { name: '/submit/hdf POST' })
      );
      await user.click(routes);
      await user.click(
        await screen.findByRole('option', { name: '/users PATCH' })
      );

      await user.click(screen.getByText('Submit'));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/users', {
        _id: 'user1',
        add_authorised_routes: ['/users PATCH'],
        remove_authorised_routes: ['/submit/hdf POST'],
      });
    });
  });
});
