import React from 'react';
import { Grid, Box, styled, Tab, Tabs, Typography, Paper } from '@mui/material';
import {
  XAxisScale,
  YAxisScale,
  FullScalarChannelMetadata,
  PlotType,
  SelectedPlotChannel,
  timeChannelName,
} from '../../app.types';
import ChartTypeButtons from './chartTypeButtons.component';
import PlotSettingsTextField from './plotSettingsTextField.component';
import XAxisTab from './xAxisTab.component';
import YAxisTab from './yAxisTab.component';

type TabValue = 'X' | 'Y';

interface TabPanelProps {
  children?: React.ReactNode;
  value: TabValue;
  label: TabValue;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, label, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== label}
      id={`${label}-tabpanel`}
      aria-labelledby={`${label}-tab`}
      {...other}
    >
      {value === label && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(label: TabValue) {
  return {
    id: `${label}-tab`,
    'aria-controls': `${label}-tabpanel`,
  };
}

const StyledTab = styled(Tab)(() => ({
  minHeight: 30,
  minWidth: 10,
  height: 30,
  width: 10,
}));

export interface PlotSettingsControllerProps {
  selectedRecordTableChannels: FullScalarChannelMetadata[];
  allChannels: FullScalarChannelMetadata[];
  plotTitle: string;
  changePlotTitle: (title: string) => void;
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
  XAxis?: string;
  changeXAxis: (value?: string) => void;
  XAxisScale: XAxisScale;
  changeXAxisScale: (XAxisScale: XAxisScale) => void;
  leftYAxisScale: YAxisScale;
  changeLeftYAxisScale: (YAxisScale: YAxisScale) => void;
  rightYAxisScale: YAxisScale;
  changeRightYAxisScale: (YAxisScale: YAxisScale) => void;
  selectedPlotChannels: SelectedPlotChannel[];
  changeSelectedPlotChannels: (
    selectedPlotChannels: SelectedPlotChannel[]
  ) => void;
  xMinimum?: number;
  xMaximum?: number;
  leftYAxisMinimum?: number;
  leftYAxisMaximum?: number;
  rightYAxisMinimum?: number;
  rightYAxisMaximum?: number;
  leftYAxisLabel?: string;
  rightYAxisLabel?: string;
  changeXMinimum: (value: number | undefined) => void;
  changeXMaximum: (value: number | undefined) => void;
  changeLeftYAxisMinimum: (value: number | undefined) => void;
  changeLeftYAxisMaximum: (value: number | undefined) => void;
  changeRightYAxisMinimum: (value: number | undefined) => void;
  changeRightYAxisMaximum: (value: number | undefined) => void;
  changeLeftYAxisLabel: (newLabel: string) => void;
  changeRightYAxisLabel: (newLabel: string) => void;
  selectedColours: string[];
  remainingColours: string[];
  changeSelectedColours: (selected: string[]) => void;
  changeRemainingColours: (remaining: string[]) => void;
}

const PlotSettingsController = (props: PlotSettingsControllerProps) => {
  const {
    selectedRecordTableChannels,
    allChannels,
    plotTitle,
    changePlotTitle,
    plotType,
    changePlotType,
    XAxis,
    changeXAxis,
    XAxisScale,
    changeXAxisScale,
    leftYAxisScale,
    changeLeftYAxisScale,
    rightYAxisScale,
    changeRightYAxisScale,
    selectedPlotChannels,
    changeSelectedPlotChannels,
    xMinimum,
    xMaximum,
    leftYAxisMinimum,
    leftYAxisMaximum,
    rightYAxisMinimum,
    rightYAxisMaximum,
    leftYAxisLabel,
    rightYAxisLabel,
    changeXMinimum,
    changeXMaximum,
    changeLeftYAxisMinimum,
    changeLeftYAxisMaximum,
    changeRightYAxisMinimum,
    changeRightYAxisMaximum,
    changeLeftYAxisLabel,
    changeRightYAxisLabel,
    selectedColours,
    remainingColours,
    changeSelectedColours,
    changeRemainingColours,
  } = props;

  const [XYTabValue, setXYTabValue] = React.useState<TabValue>('X');

  const handleXYTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: TabValue) => {
      setXYTabValue(newValue);
    },
    [setXYTabValue]
  );

  const handleXAxisChange = React.useCallback(
    (value?: string) => {
      changeXAxis(value);
      if (value === timeChannelName) {
        changeXAxisScale('time');
      } else {
        changeXAxisScale('linear');
      }
      changeXMinimum(undefined);
      changeXMaximum(undefined);
    },
    [changeXAxis, changeXMinimum, changeXMaximum, changeXAxisScale]
  );

  const YAxisConfig = (
    <YAxisTab
      selectedRecordTableChannels={selectedRecordTableChannels}
      allChannels={allChannels}
      selectedPlotChannels={selectedPlotChannels}
      changeSelectedPlotChannels={changeSelectedPlotChannels}
      initialLeftYAxisMinimum={leftYAxisMinimum}
      initialLeftYAxisMaximum={leftYAxisMaximum}
      changeLeftYAxisMinimum={changeLeftYAxisMinimum}
      changeLeftYAxisMaximum={changeLeftYAxisMaximum}
      initialRightYAxisMinimum={rightYAxisMinimum}
      initialRightYAxisMaximum={rightYAxisMaximum}
      changeRightYAxisMinimum={changeRightYAxisMinimum}
      changeRightYAxisMaximum={changeRightYAxisMaximum}
      leftYAxisScale={leftYAxisScale}
      changeLeftYAxisScale={changeLeftYAxisScale}
      rightYAxisScale={rightYAxisScale}
      changeRightYAxisScale={changeRightYAxisScale}
      leftYAxisLabel={leftYAxisLabel}
      changeLeftYAxisLabel={changeLeftYAxisLabel}
      rightYAxisLabel={rightYAxisLabel}
      changeRightYAxisLabel={changeRightYAxisLabel}
      initialSelectedColours={selectedColours}
      initialRemainingColours={remainingColours}
      changeSelectedColours={changeSelectedColours}
      changeRemainingColours={changeRemainingColours}
    />
  );

  const XAxisConfig = (
    <XAxisTab
      allChannels={allChannels}
      XAxisScale={XAxisScale}
      XAxis={XAxis}
      changeXAxis={changeXAxis}
      changeXAxisScale={changeXAxisScale}
      initialXMinimum={xMinimum}
      initialXMaximum={xMaximum}
      changeXMinimum={changeXMinimum}
      changeXMaximum={changeXMaximum}
    />
  );

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <PlotSettingsTextField value={plotTitle} onChange={changePlotTitle} />
      </Grid>
      <Grid item>
        <ChartTypeButtons
          plotType={plotType}
          changePlotType={changePlotType}
          XAxis={XAxis}
          changeXAxis={handleXAxisChange}
        />
      </Grid>
      <Grid item>
        {XAxis !== timeChannelName && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={XYTabValue}
              onChange={handleXYTabChange}
              aria-label="tabs"
              sx={{ height: 30, minHeight: 30 }}
            >
              <StyledTab value="X" label="X" {...a11yProps('X')} />
              <StyledTab value="Y" label="Y" {...a11yProps('Y')} />
            </Tabs>
          </Box>
        )}
        {XAxis !== timeChannelName ? (
          <TabPanel value={XYTabValue} label={'X'}>
            {XAxisConfig}
          </TabPanel>
        ) : (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ padding: 1, marginBottom: 1 }}
          >
            <Typography>X Axis Config</Typography>
            {XAxisConfig}
          </Paper>
        )}
        {XAxis !== timeChannelName ? (
          <TabPanel value={XYTabValue} label={'Y'}>
            {YAxisConfig}
          </TabPanel>
        ) : (
          <Paper elevation={0} variant="outlined" sx={{ padding: 1 }}>
            <Typography>Y Axes Config</Typography>
            {YAxisConfig}
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default PlotSettingsController;
