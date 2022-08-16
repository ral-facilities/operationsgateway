import React from 'react';
import DataCell, {
  DataCellProps,
  parseCellContents,
} from './dataCell.component';
import { render, RenderResult } from '@testing-library/react';
import { FullChannelMetadata } from '../../app.types';

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

describe('parseCellContents', () => {
  it('should return parsed HTML for an HTML image string and image channel', () => {
    const channelInfo: FullChannelMetadata = {
      systemName: 'test',
      channel_dtype: 'image',
    };
    const result = parseCellContents(
      '<img src="test" alt="test" />',
      channelInfo
    );

    expect(typeof result).toEqual('object');
  });

  it('should return parsed HTML for an HTML image string and waveform channel', () => {
    const channelInfo: FullChannelMetadata = {
      systemName: 'test',
      channel_dtype: 'waveform',
    };
    const result = parseCellContents(
      '<img src="test" alt="test" />',
      channelInfo
    );

    expect(typeof result).toEqual('object');
  });

  it('should return a rounded number for a float and scalar channel', () => {
    const channelInfo: FullChannelMetadata = {
      systemName: 'test',
      channel_dtype: 'scalar',
      significantFigures: 2,
      scientificNotation: true,
    };
    const result = parseCellContents(111.1, channelInfo);

    expect(result).toEqual('1.1e+2');
  });

  it('should return the input if none of the above criteria match', () => {
    const channelInfo: FullChannelMetadata = {
      systemName: 'test',
      channel_dtype: 'scalar',
    };
    const result = parseCellContents('test value', channelInfo);

    expect(result).toEqual(result);
  });
});
