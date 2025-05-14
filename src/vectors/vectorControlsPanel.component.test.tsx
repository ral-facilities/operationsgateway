import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderComponentWithProviders } from '../testUtils';
import VectorControlPanel from './vectorControlsPanel.component';

describe('Vector control panel component', () => {
  let props: React.ComponentProps<typeof VectorControlPanel>;
  const onChangeRange = vi.fn();

  beforeEach(() => {
    props = {
      vector: { data: [1, 2, 3, 4, 5] },
      range: { skip: 0, limit: 4 },
      onChangeRange,
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(<VectorControlPanel {...props} />);
  };

  it('renders correctly', async () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders range level slider, changes lower level on change and changes higher level on change', async () => {
    createView();

    const sliderInput = screen.getAllByRole('slider');

    const lowerSliderInput = sliderInput[0];

    fireEvent.change(lowerSliderInput, { target: { value: 2 } });

    expect(onChangeRange).toHaveBeenCalledWith({
      limit: 4,
      skip: 2,
    });
  });

  it('renders range level slider, changes higher level on change', async () => {
    createView();

    const sliderInput = screen.getAllByRole('slider');

    const upperSliderInput = sliderInput[1];

    fireEvent.change(upperSliderInput, { target: { value: 3 } });

    expect(onChangeRange).toHaveBeenCalledWith({
      limit: 3,
      skip: 0,
    });
  });
});
