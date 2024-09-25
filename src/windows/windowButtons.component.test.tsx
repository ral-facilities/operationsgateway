import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { PlotDataset, SelectedPlotChannel } from '../app.types';
import {
  constructDataRows,
  formatTooltipLabel,
  ImageButtons,
  ImageButtonsProps,
  PlotButtons,
  PlotButtonsProps,
  TraceButtons,
  TraceButtonsProps,
} from './windowButtons.component';

describe('Window buttons components', () => {
  const mockLinkClick = vi.fn();
  const mockLinkRemove = vi.fn();
  const mockLinkSetAttribute = vi.fn();
  let mockLink: HTMLAnchorElement;
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();

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
    vi.clearAllMocks();
    document.createElement = document.originalCreateElement;
    document.body.appendChild = document.body.originalAppendChild;
  });

  describe('Plot buttons component', () => {
    const canvas = document.createElement('canvas');
    const canvasToDataURLSpy = vi.spyOn(canvas, 'toDataURL');
    let plotButtonsProps: PlotButtonsProps;

    const toggleGridVisibility = vi.fn();
    const toggleAxesLabelsVisibility = vi.fn();
    const savePlot = vi.fn();
    const resetView = vi.fn();

    beforeEach(() => {
      plotButtonsProps = {
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
        gridVisible: true,
        axesLabelsVisible: true,
        toggleGridVisibility,
        toggleAxesLabelsVisibility,
        resetView,
        savePlot,
        selectedPlotChannels: [
          {
            name: 'shotNum',
            units: '',
            displayName: 'Shot Number',
            options: {
              visible: true,
              lineStyle: 'solid',
              colour: 'blue',
              yAxis: 'left',
            },
          },
        ],
      };
    });

    it('renders plot buttons group', () => {
      const view = render(<PlotButtons {...plotButtonsProps} />);

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders alternate button text when axes labels and grid are hidden', () => {
      plotButtonsProps = {
        ...plotButtonsProps,
        gridVisible: false,
        axesLabelsVisible: false,
      };
      render(<PlotButtons {...plotButtonsProps} />);

      expect(screen.getByText('Show Grid')).toBeInTheDocument();
      expect(screen.getByText('Show Axes Labels')).toBeInTheDocument();
    });

    it('generates PNG file when export button is clicked', async () => {
      render(<PlotButtons {...plotButtonsProps} />);

      // have to mock after render otherwise it fails to render our component
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockLink;
        else return document.originalCreateElement(tag);
      });
      document.body.appendChild = vi.fn().mockImplementation((node) => {
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
      plotButtonsProps.canvasRef.current = null;
      render(<PlotButtons {...plotButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Export Plot' }));

      expect(canvasToDataURLSpy).not.toHaveBeenCalled();
    });

    it('generates csv file when export data button is clicked', async () => {
      render(<PlotButtons {...plotButtonsProps} />);

      // have to mock after render otherwise it fails to render our component
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockLink;
        else return document.originalCreateElement(tag);
      });
      document.body.appendChild = vi.fn().mockImplementation((node) => {
        if (!(node instanceof Node)) return mockLink;
        else return document.body.originalAppendChild(node);
      });

      await user.click(
        screen.getByRole('button', { name: 'Export Plot Data' })
      );

      expect(document.createElement).toHaveBeenCalledWith('a');

      expect(mockLink.href).toEqual(
        'data:text/csv;charset=utf-8,timestamp,Shot%20Number/shotNum/%0A2022-08-09%2009:30:00,1%0A2022-08-09%2009:31:00,2%0A2022-08-09%2009:32:00,3'
      );
      expect(mockLink.download).toEqual('test.csv');
      expect(mockLink.target).toEqual('_blank');
      expect(mockLink.style.display).toEqual('none');

      expect(mockLinkClick).toHaveBeenCalled();
      expect(mockLinkRemove).toHaveBeenCalled();
    });

    it('does nothing when export data button is clicked if data is not correct', async () => {
      plotButtonsProps.data = undefined;
      const { unmount } = render(<PlotButtons {...plotButtonsProps} />);
      const createElementSpy = vi.spyOn(document, 'createElement');

      await user.click(
        screen.getByRole('button', { name: 'Export Plot Data' })
      );

      expect(createElementSpy).not.toHaveBeenCalledWith('a');

      unmount();

      plotButtonsProps.data = [];
      render(<PlotButtons {...plotButtonsProps} />);

      await user.click(
        screen.getByRole('button', { name: 'Export Plot Data' })
      );

      expect(createElementSpy).not.toHaveBeenCalledWith('a');
    });

    it('calls toggleGridVisibility when grid visibility button clicked', async () => {
      render(<PlotButtons {...plotButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Hide Grid' }));
      expect(toggleGridVisibility).toHaveBeenCalled();
    });

    it('calls toggleAxesLabelsVisibility when axes labels visibility button clicked', async () => {
      render(<PlotButtons {...plotButtonsProps} />);

      await user.click(
        screen.getByRole('button', { name: 'Hide Axes Labels' })
      );
      expect(toggleAxesLabelsVisibility).toHaveBeenCalled();
    });

    it('calls resetView when Reset View button clicked', async () => {
      render(<PlotButtons {...plotButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Reset View' }));
      expect(resetView).toHaveBeenCalled();
    });

    it('calls savePlot when Save button clicked', async () => {
      render(<PlotButtons {...plotButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(savePlot).toHaveBeenCalled();
    });
  });

  describe('Trace buttons component', () => {
    const canvas = document.createElement('canvas');
    const canvasToDataURLSpy = vi.spyOn(canvas, 'toDataURL');
    let traceButtonsProps: TraceButtonsProps;

    const togglePointsVisibility = vi.fn();
    const resetView = vi.fn();

    beforeEach(() => {
      traceButtonsProps = {
        data: {
          _id: 'test',
          x: [1, 2, 3],
          y: [5, 6, 4],
        },
        canvasRef: {
          current: canvas,
        },
        title: 'test',
        resetView,
        pointsVisible: true,
        togglePointsVisibility,
      };
    });

    it('renders trace buttons group', () => {
      const view = render(<TraceButtons {...traceButtonsProps} />);

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders alternate button text when points are hidden', () => {
      traceButtonsProps = {
        ...traceButtonsProps,
        pointsVisible: false,
      };
      render(<TraceButtons {...traceButtonsProps} />);

      expect(screen.getByText('Show Points')).toBeInTheDocument();
    });

    it('generates PNG file when export button is clicked', async () => {
      render(<TraceButtons {...traceButtonsProps} />);

      // have to mock after render otherwise it fails to render our component
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockLink;
        else return document.originalCreateElement(tag);
      });
      document.body.appendChild = vi.fn().mockImplementation((node) => {
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
      traceButtonsProps.canvasRef.current = null;
      render(<TraceButtons {...traceButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Export Plot' }));

      expect(canvasToDataURLSpy).not.toHaveBeenCalled();
    });

    it('generates csv file when export data button is clicked', async () => {
      render(<TraceButtons {...traceButtonsProps} />);

      // have to mock after render otherwise it fails to render our component
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockLink;
        else return document.originalCreateElement(tag);
      });
      document.body.appendChild = vi.fn().mockImplementation((node) => {
        if (!(node instanceof Node)) return mockLink;
        else return document.body.originalAppendChild(node);
      });

      await user.click(
        screen.getByRole('button', { name: 'Export Plot Data' })
      );

      expect(document.createElement).toHaveBeenCalledWith('a');

      expect(mockLink.href).toEqual(
        'data:text/csv;charset=utf-8,x,y%0A1,5%0A2,6%0A3,4'
      );
      expect(mockLink.download).toEqual('test.csv');
      expect(mockLink.target).toEqual('_blank');
      expect(mockLink.style.display).toEqual('none');

      expect(mockLinkClick).toHaveBeenCalled();
      expect(mockLinkRemove).toHaveBeenCalled();
    });

    it('does nothing when export data button is clicked if data is not correct', async () => {
      traceButtonsProps.data = undefined;
      render(<TraceButtons {...traceButtonsProps} />);

      const createElementSpy = vi.spyOn(document, 'createElement');

      await user.click(
        screen.getByRole('button', { name: 'Export Plot Data' })
      );

      expect(createElementSpy).not.toHaveBeenCalledWith('a');
    });

    it('calls toggleGridVisibility when grid visibility button clicked', async () => {
      render(<TraceButtons {...traceButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Hide Points' }));
      expect(togglePointsVisibility).toHaveBeenCalled();
    });

    it('calls resetView when Reset View button clicked', async () => {
      render(<TraceButtons {...traceButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Reset View' }));
      expect(resetView).toHaveBeenCalled();
    });
  });

  describe('Image buttons component', () => {
    let imageButtonsProps: ImageButtonsProps;

    const resetView = vi.fn();

    beforeEach(() => {
      imageButtonsProps = {
        data: 'test_data_uri',
        title: 'test',
        resetView,
      };
    });

    it('renders image buttons group', () => {
      const view = render(<ImageButtons {...imageButtonsProps} />);

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('generates PNG file when export button is clicked', async () => {
      render(<ImageButtons {...imageButtonsProps} />);

      // have to mock after render otherwise it fails to render our component
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockLink;
        else return document.originalCreateElement(tag);
      });
      document.body.appendChild = vi.fn().mockImplementation((node) => {
        if (!(node instanceof Node)) return mockLink;
        else return document.body.originalAppendChild(node);
      });

      await user.click(screen.getByRole('button', { name: 'Export Image' }));

      expect(document.createElement).toHaveBeenCalledWith('a');

      expect(mockLink.href).toEqual('test_data_uri');
      expect(mockLink.download).toEqual('test.png');
      expect(mockLink.target).toEqual('_blank');
      expect(mockLink.style.display).toEqual('none');

      expect(mockLinkClick).toHaveBeenCalled();
      expect(mockLinkRemove).toHaveBeenCalled();
    });

    it('does nothing when export button is clicked if data is undefined', async () => {
      imageButtonsProps.data = undefined;
      render(<ImageButtons {...imageButtonsProps} />);

      // have to mock after render otherwise it fails to render our component
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') return mockLink;
        else return document.originalCreateElement(tag);
      });

      await user.click(screen.getByRole('button', { name: 'Export Image' }));

      expect(document.createElement).not.toHaveBeenCalledWith('a');
    });

    it('calls resetView when Reset View button clicked', async () => {
      render(<ImageButtons {...imageButtonsProps} />);

      await user.click(screen.getByRole('button', { name: 'Reset View' }));
      expect(resetView).toHaveBeenCalled();
    });
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

  let testSelectedPlotChannel = [
    {
      name: 'channel_1',
      units: '',
      displayName: 'Channel 1',
      options: {
        visible: true,
        lineStyle: 'solid',
        colour: 'blue',
        yAxis: 'left',
      },
    },
  ] as SelectedPlotChannel[];

  it('constructs a 2D array of CSV rows with an x-axis and one data channel', () => {
    const expectedResult = [
      ['x_axis', 'Channel 1/channel_1/'],
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const result = constructDataRows(XAxis, testPlots, testSelectedPlotChannel);
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

    testSelectedPlotChannel = [
      {
        name: 'channel_1',
        units: '',
        displayName: 'Channel 1',
        options: {
          visible: true,
          lineStyle: 'solid',
          colour: 'blue',
          yAxis: 'left',
        },
      },
      {
        name: 'channel_2',
        units: 'mg',
        displayName: 'Channel 2',
        options: {
          visible: true,
          lineStyle: 'solid',
          colour: 'blue',
          yAxis: 'left',
        },
      },
      {
        name: 'channel_3',
        units: 'cm',
        displayName: 'Channel 3',
        options: {
          visible: true,
          lineStyle: 'solid',
          colour: 'blue',
          yAxis: 'left',
        },
      },
    ] as SelectedPlotChannel[];

    const expectedResult = [
      [
        'x_axis',
        'Channel 1/channel_1/',
        'Channel 2/channel_2/mg',
        'Channel 3/channel_3/cm',
      ],
      [1, 1001, 2001, ''],
      [2, 1002, 2002, ''],
      [3, 1003, 2003, ''],
      [4, '', '', 3004],
      [5, '', '', 3005],
      [6, '', '', 3006],
    ];
    const result = constructDataRows(XAxis, testPlots, testSelectedPlotChannel);
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
      ['x_axis', 'Channel 1/channel_1/'],
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const result = constructDataRows(XAxis, testPlots, testSelectedPlotChannel);
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

    testSelectedPlotChannel = [
      {
        name: 'shotnum',
        units: '',
        displayName: 'Shot Number',
        options: {
          visible: true,
          lineStyle: 'solid',
          colour: 'blue',
          yAxis: 'left',
        },
      },
    ];

    const expectedResult = [
      ['timestamp', 'Shot Number/shotnum/'],
      ['2022-01-01 00:00:00', 1],
      ['2022-01-01 00:01:00', 2],
      ['2022-01-01 00:02:00', 3],
    ];
    const result = constructDataRows(XAxis, testPlots, testSelectedPlotChannel);
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
