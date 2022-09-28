import React from 'react';
import PlotButtons, {
  PlotButtonsProps,
  constructDataRows,
  formatTooltipLabel,
} from './plotButtons.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlotDataset } from '../app.types';

describe('Plot Buttons component', () => {
  const canvas = document.createElement('canvas');
  const canvasToDataURLSpy = jest.spyOn(canvas, 'toDataURL');
  const plotButtonsProps: PlotButtonsProps = {
    data: [
      {
        name: 'shotNum',
        data: [
          {
            timestamp: new Date('2022-08-09T09:30:00').getTime(),
            shotNum: 1,
          },
          {
            timestamp: new Date('2022-08-09T09:31:00').getTime(),
            shotNum: 2,
          },
          {
            timestamp: new Date('2022-08-09T09:32:00').getTime(),
            shotNum: 3,
          },
        ],
      },
    ],
    XAxis: 'timestamp',
    canvasRef: {
      current: canvas,
    },
    title: 'test',
  };

  const mockLinkClick = jest.fn();
  const mockLinkRemove = jest.fn();
  const mockLinkSetAttribute = jest.fn();
  let mockLink: HTMLAnchorElement = {};

  beforeEach(() => {
    mockLink = {
      href: '',
      download: '',
      click: mockLinkClick,
      remove: mockLinkRemove,
      target: '',
      style: {},
      setAttribute: mockLinkSetAttribute,
    };
    document.originalCreateElement = document.createElement;
    document.body.originalAppendChild = document.body.appendChild;
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.createElement = document.originalCreateElement;
    document.body.appendChild = document.body.originalAppendChild;
  });

  it('renders plot buttons group', () => {
    const view = render(<PlotButtons {...plotButtonsProps} />);

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('generates PNG file when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<PlotButtons {...plotButtonsProps} />);

    // have to mock after render otherwise it fails to render our component
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      else return document.originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn().mockImplementation((node) => {
      if (!(node instanceof Node)) return mockLink;
      else return document.body.originalAppendChild(node);
    });

    await user.click(screen.getByRole('button', { name: 'Export Plot' }));

    expect(document.createElement).toHaveBeenCalledWith('a');

    expect(canvasToDataURLSpy).toHaveBeenCalled();
    expect(mockLink.href).toEqual('data:image/png;base64,00');
    expect(mockLink.download).toEqual('test.png');
    expect(mockLink.target).toEqual('_blank');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
  });

  it('does nothing when export button is clicked if canvasRef is null', async () => {
    const user = userEvent.setup();
    plotButtonsProps.canvasRef.current = null;
    render(<PlotButtons {...plotButtonsProps} />);

    await user.click(screen.getByRole('button', { name: 'Export Plot' }));

    expect(canvasToDataURLSpy).not.toHaveBeenCalled();
  });

  it('generates csv file when export data button is clicked', async () => {
    const user = userEvent.setup();
    render(<PlotButtons {...plotButtonsProps} />);

    // have to mock after render otherwise it fails to render our component
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      else return document.originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn().mockImplementation((node) => {
      if (!(node instanceof Node)) return mockLink;
      else return document.body.originalAppendChild(node);
    });

    await user.click(screen.getByRole('button', { name: 'Export Plot Data' }));

    expect(document.createElement).toHaveBeenCalledWith('a');

    expect(mockLink.href).toEqual(
      'data:text/csv;charset=utf-8,timestamp,shotNum%0A2022-08-09%2009:30:00,1%0A2022-08-09%2009:31:00,2%0A2022-08-09%2009:32:00,3'
    );
    expect(mockLink.download).toEqual('test.csv');
    expect(mockLink.target).toEqual('_blank');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
  });

  it('does nothing when export data button is clicked if data is not correct', async () => {
    const user = userEvent.setup();
    plotButtonsProps.data = undefined;
    const { unmount } = render(<PlotButtons {...plotButtonsProps} />);
    const createElementSpy = jest.spyOn(document, 'createElement');

    await user.click(screen.getByRole('button', { name: 'Export Plot Data' }));

    expect(createElementSpy).not.toHaveBeenCalledWith('a');

    unmount();

    plotButtonsProps.data = [];
    render(<PlotButtons {...plotButtonsProps} />);

    await user.click(screen.getByRole('button', { name: 'Export Plot Data' }));

    expect(createElementSpy).not.toHaveBeenCalledWith('a');
  });
});

describe('constructDataRows', () => {
  let XAxis = 'x_axis';
  let testPlots: PlotDataset[] = [
    {
      name: 'channel_1',
      data: [
        {
          x_axis: 1,
          channel_1: 1,
        },
        {
          x_axis: 2,
          channel_1: 2,
        },
        {
          x_axis: 3,
          channel_1: 3,
        },
      ],
    },
  ];

  it('constructs a 2D array of CSV rows with an x-axis and one data channel', () => {
    const expectedResult = [
      ['x_axis', 'channel_1'],
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const result = constructDataRows(XAxis, testPlots);
    expect(result).toEqual(expectedResult);
  });

  it('constructs a 2D array of CSV rows with an x-axis and multiple data channels with the same x-axis values', () => {
    const XAxis = 'x_axis';
    testPlots = [
      {
        name: 'channel_1',
        data: [
          {
            x_axis: 1,
            channel_1: 1001,
          },
          {
            x_axis: 2,
            channel_1: 1002,
          },
          {
            x_axis: 3,
            channel_1: 1003,
          },
        ],
      },
      {
        name: 'channel_2',
        data: [
          {
            x_axis: 1,
            channel_2: 2001,
          },
          {
            x_axis: 2,
            channel_2: 2002,
          },
          {
            x_axis: 3,
            channel_2: 2003,
          },
        ],
      },
      {
        name: 'channel_3',
        data: [
          {
            x_axis: 4,
            channel_3: 3004,
          },
          {
            x_axis: 5,
            channel_3: 3005,
          },
          {
            x_axis: 6,
            channel_3: 3006,
          },
        ],
      },
    ];

    const expectedResult = [
      ['x_axis', 'channel_1', 'channel_2', 'channel_3'],
      [1, 1001, 2001, ''],
      [2, 1002, 2002, ''],
      [3, 1003, 2003, ''],
      [4, '', '', 3004],
      [5, '', '', 3005],
      [6, '', '', 3006],
    ];
    const result = constructDataRows(XAxis, testPlots);
    expect(result).toEqual(expectedResult);
  });

  it('sorts data by x-axis value ascending', () => {
    testPlots = [
      {
        name: 'channel_1',
        data: [
          {
            x_axis: 3,
            channel_1: 3,
          },
          {
            x_axis: 2,
            channel_1: 2,
          },
          {
            x_axis: 1,
            channel_1: 1,
          },
        ],
      },
    ];

    const expectedResult = [
      ['x_axis', 'channel_1'],
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const result = constructDataRows(XAxis, testPlots);
    expect(result).toEqual(expectedResult);
  });

  it('formats timestamp correctly while constructing rows', () => {
    XAxis = 'timestamp';
    testPlots = [
      {
        name: 'shotnum',
        data: [
          {
            timestamp: 1640995200000,
            shotnum: 1,
          },
          {
            timestamp: 1640995260000,
            shotnum: 2,
          },
          {
            timestamp: 1640995320000,
            shotnum: 3,
          },
        ],
      },
    ];

    const expectedResult = [
      ['timestamp', 'shotnum'],
      ['2022-01-01 00:00:00', 1],
      ['2022-01-01 00:01:00', 2],
      ['2022-01-01 00:02:00', 3],
    ];
    const result = constructDataRows(XAxis, testPlots);
    expect(result).toEqual(expectedResult);
  });
});

describe('formatTooltipLabel function', () => {
  it('formats timestamp correctly', () => {
    const label = 1640995200000;
    const result = formatTooltipLabel(label, 'time');
    expect(result).toEqual('2022-01-01 00:00:00');
  });

  it('returns the original label if it is not a date', () => {
    const label = 123456;
    const result = formatTooltipLabel(label, 'linear');
    expect(result).toEqual(label);
  });
});
