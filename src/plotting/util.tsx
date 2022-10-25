import { SelectedPlotChannel } from '../app.types';

export const deepCopySelectedPlotChannels = (
  original: SelectedPlotChannel[]
): SelectedPlotChannel[] => {
  return JSON.parse(JSON.stringify(original));
};
