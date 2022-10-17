import { SelectedPlotChannel } from '../app.types';

// TODO test this
export const deepCopySelectedPlotChannels = (
  original: SelectedPlotChannel[]
): SelectedPlotChannel[] => {
  return original.map((currentChannel: SelectedPlotChannel) => ({
    name: currentChannel.name,
    options: {
      ...currentChannel.options,
    },
  }));
};
