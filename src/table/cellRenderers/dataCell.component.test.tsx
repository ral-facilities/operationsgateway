import { render, RenderResult } from '@testing-library/react';
import DataCell, { DataCellProps } from './dataCell.component';

describe('Data Cell', () => {
  let props: DataCellProps;

  const createView = (): RenderResult => {
    return render(
      <table>
        <tbody>
          <tr>
            <DataCell {...props} />
          </tr>
        </tbody>
      </table>
    );
  };

  beforeEach(() => {
    props = {
      dataKey: 'test',
      rowData: 'test data',
    };
  });

  it('renders correctly', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it.todo('more tests');
});
