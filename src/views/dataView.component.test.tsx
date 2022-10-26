import React from 'react';
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataView from './dataView.component';
import { renderComponentWithProviders, testRecords } from '../setupTests';
import axios from 'axios';

jest.mock('./dateTimeInput.component', () => (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-dateTimeInput data-testid="mock-dateTimeInput" />
));

jest.mock('./recordTable.component', () => (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-recordTable data-testid="mock-recordTable">
    {Object.entries(props).map(
      ([propName, propValue]) =>
        `${propName}=${JSON.stringify(propValue, null, 2)}\n`
    )}
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
  </mock-recordTable>
));

jest.mock('../table/columnCheckboxes.component', () => (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-columnCheckboxes data-testid="mock-columnCheckboxes" />
));

describe('Data View', () => {
  const createView = (): RenderResult => {
    return renderComponentWithProviders(<DataView />);
  };

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: testRecords });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('opens the filter dialogue when the filters button is clicked and closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    const dialogue = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialogue).toBeVisible();

    await user.click(within(dialogue).getByRole('button', { name: 'Close' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: 'Filters' })
    );
  });

  it.todo(
    'opens the filter dialogue when the filter button in a data header is clicked'
  );
});
