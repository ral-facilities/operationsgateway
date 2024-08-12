import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import experimentsJson from '../../mocks/experiments.json';
import Experiment, { type ExperimentProps } from './experiment.component';

describe('Experiment search', () => {
  let props: ExperimentProps;
  const onExperimentChange = jest.fn();
  const resetTimeFrame = jest.fn();
  const changeExperimentTimeframe = jest.fn();
  const resetShotnumber = jest.fn();
  const searchParamsUpdated = jest.fn();
  let user;

  const createView = (): RenderResult => {
    return render(<Experiment {...props} />);
  };

  beforeEach(() => {
    props = {
      experiments: experimentsJson,
      onExperimentChange,
      experiment: null,
      resetTimeframe: resetTimeFrame,
      changeExperimentTimeframe,
      resetShotnumber: resetShotnumber,
      searchParamsUpdated: searchParamsUpdated,
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { asFragment } = createView();
    await user.click(screen.getByLabelText('open experiment search box'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('can open and close its popup window', async () => {
    createView();

    await user.click(screen.getByLabelText('open experiment search box'));
    const experimentPopup = screen.getByRole('dialog');
    expect(
      within(experimentPopup).getByLabelText('Select your experiment')
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText('close experiment search box'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Select your experiment')
    ).not.toBeInTheDocument();
  });

  it('displays the experiment id', () => {
    props = {
      ...props,
      experiment: {
        _id: '18325019-5',
        end_date: '2019-06-12T17:00:00',
        experiment_id: '18325019',
        part: 5,
        start_date: '2019-06-12T09:00:00',
      },
    };
    createView();
    expect(screen.getByText('ID 18325019 (part 5)')).toBeInTheDocument();
  });

  it('should call onExperimentChange when option is selected and not when it is cleared', async () => {
    createView();

    const expectedExperiment = {
      _id: '22110007-1',
      end_date: '2022-01-15T12:00:00',
      experiment_id: '22110007',
      part: 1,
      start_date: '2022-01-12T13:00:00',
    };

    await user.click(screen.getByLabelText('open experiment search box'));
    const experimentPopup = screen.getByRole('combobox');
    expect(experimentPopup).toBeInTheDocument('close experiment search box');

    await user.type(experimentPopup, '221{arrowdown}{enter}');

    expect(onExperimentChange).toHaveBeenCalledWith(expectedExperiment);
    expect(resetTimeFrame).toHaveBeenCalledTimes(1);
    expect(resetShotnumber).toHaveBeenCalledTimes(1);
    expect(searchParamsUpdated).toHaveBeenCalled();
    expect(changeExperimentTimeframe).toHaveBeenCalledWith(expectedExperiment);
    expect(experimentPopup).toHaveValue('22110007');
  });
});
