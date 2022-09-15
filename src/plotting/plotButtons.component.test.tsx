import React from 'react';
import PlotButtons, { PlotButtonsProps } from './plotButtons.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Plot Buttons component', () => {
  const container = document.createElement('div');
  const svg = document.createElement('svg');
  container.appendChild(svg);
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
    svgRef: {
      current: container,
    },
    title: 'test',
  };

  const mockLinkClick = jest.fn();
  const mockLinkRemove = jest.fn();
  const mockLinkSetAttribute = jest.fn();
  let mockLink: HTMLAnchorElement = {};
  window.URL.createObjectURL = jest.fn().mockReturnValue('object url');
  window.URL.revokeObjectURL = jest.fn();

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

  it('generates SVG file when export button is clicked', async () => {
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

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(mockLink.href).toEqual('object url');
    expect(mockLink.download).toEqual('test.svg');
    expect(mockLink.target).toEqual('_blank');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('does nothing when export button is clicked if svgRef is not correct', async () => {
    const user = userEvent.setup();
    plotButtonsProps.svgRef.current = null;
    const { unmount } = render(<PlotButtons {...plotButtonsProps} />);

    await user.click(screen.getByRole('button', { name: 'Export Plot' }));

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();

    unmount();

    // not valid as it's not within the container
    plotButtonsProps.svgRef.current = svg;
    render(<PlotButtons {...plotButtonsProps} />);

    await user.click(screen.getByRole('button', { name: 'Export Plot' }));

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
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
