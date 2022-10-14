import { SelectedPlotChannel } from '../app.types';

// TODO test this
export const deepCopySelectedPlotChannels = (
  original: SelectedPlotChannel[]
): SelectedPlotChannel[] => {
  return original.map((currentChannel: SelectedPlotChannel) => ({
    name: currentChannel.name,
    options: {
      visible: currentChannel.options.visible,
      lineStyle: currentChannel.options.lineStyle,
      colour: currentChannel.options.colour,
      yAxis: currentChannel.options.yAxis,
    },
  }));
};
