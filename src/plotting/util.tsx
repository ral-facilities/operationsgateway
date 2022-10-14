import { SelectedPlotChannel } from '../app.types';

export const deepCopySelectedPlotChannels = (
  original: SelectedPlotChannel[]
): SelectedPlotChannel[] => {
  return original.map((currentChannel: SelectedPlotChannel) => ({
    name: currentChannel.name,
    options: {
      visible: currentChannel.options.visible,
      lineStyle: currentChannel.options.lineStyle,
      colour: currentChannel.options.colour,
    },
  }));
};
