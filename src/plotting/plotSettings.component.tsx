import React from 'react';
import {
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Box,
  Tab,
  Tabs,
  styled,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Autocomplete,
  Typography,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ScatterPlot, ShowChart, Search, Close } from '@mui/icons-material';
import { AxisSettings, PlotType } from '../app.types';
import { useAvailableColumns } from '../api/channels';
import { Column } from 'react-table';

const StyledClose = styled(Close)(() => ({
  cursor: 'pointer',
  color: 'black',
  '&:hover': {
    color: 'red',
  },
}));

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

export interface PlotSettingsProps {
  changePlotTitle: (title: string) => void;
  plotType: PlotType;
  changePlotType: (plotType: PlotType) => void;
  XAxis: string;
  YAxis: string;
  changeXAxis: (value: string) => void;
  changeYAxis: (value: string) => void;
  XAxisSettings: AxisSettings;
  changeXAxisSettings: (XAxisSettings: AxisSettings) => void;
  YAxesSettings: AxisSettings;
  changeYAxesSettings: (YAxesSettings: AxisSettings) => void;
}

type Scale = AxisSettings['scale'];

const PlotSettings = (props: PlotSettingsProps) => {
  const {
    changePlotTitle,
    plotType,
    changePlotType,
    XAxis,
    YAxis,
    changeXAxis,
    changeYAxis,
    XAxisSettings,
    changeXAxisSettings,
    YAxesSettings,
    changeYAxesSettings,
  } = props;
  const { scale: XScale } = XAxisSettings;
  const { scale: YScale } = YAxesSettings;

  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

  const [XAxisInputVal, setXAxisInputVal] = React.useState<string>('');
  const [YAxisInputVal, setYAxisInputVal] = React.useState<string>('');

  const handleChangeTitle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  const handleChangeChartType = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, newChartType: PlotType | null) => {
      changePlotType(newChartType ?? 'scatter');
    },
    [changePlotType]
  );

  const handleChangeXScale = React.useCallback(
    (value: string) => {
      changeXAxisSettings({
        ...XAxisSettings,
        scale: value as Scale,
      });
    },
    [XAxisSettings, changeXAxisSettings]
  );

  const handleChangeYScale = React.useCallback(
    (value: string) => {
      changeYAxesSettings({
        ...YAxesSettings,
        scale: value as Scale,
      });
    },
    [YAxesSettings, changeYAxesSettings]
  );

  const handleXAxisChange = React.useCallback(
    (value: string) => {
      changeXAxis(value);
      if (value === 'timestamp') {
        handleChangeXScale('time');
      } else {
        handleChangeXScale('linear');
      }
    },
    [changeXAxis, handleChangeXScale]
  );

  const handleYAxisChange = React.useCallback(
    (value: string) => {
      changeYAxis(value);
      if (value === 'timestamp') {
        handleChangeYScale('time');
      } else {
        handleChangeYScale('linear');
      }
    },
    [changeYAxis, handleChangeYScale]
  );

  React.useEffect(() => {
    changePlotTitle(deferredTitle);
  }, [changePlotTitle, deferredTitle]);

  const [XYTabValue, setXYTabValue] = React.useState<TabValue>('X');

  const handleXYTabChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: TabValue) => {
      setXYTabValue(newValue);
    },
    [setXYTabValue]
  );

  const { data: availableColumns } = useAvailableColumns();

  const [axisSelectionOptions, setAxisSelectionOptions] = React.useState<
    string[]
  >([]);

  const populateChannels = (availCols: Column[]): void => {
    let ops: string[] = [];

    availCols.forEach((col: Column) => {
      ops.push(col.accessor as string);
    });

    setAxisSelectionOptions(ops);
  };

  React.useEffect(() => {
    if (availableColumns) populateChannels(availableColumns);
  }, [availableColumns]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <TextField
          label="Title"
          variant="outlined"
          size="small"
          value={title}
          onChange={handleChangeTitle}
          fullWidth
          InputProps={{ style: { fontSize: 12 } }}
          InputLabelProps={{ style: { fontSize: 12 } }}
        />
      </Grid>
      <Grid container item spacing={1}>
        {/* TODO: what do these control? we need to hook them up */}
        <Grid item xs={6}>
          <TextField
            label="Hours"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{ style: { fontSize: 12 } }}
            InputLabelProps={{ style: { fontSize: 12 } }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Points"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{ style: { fontSize: 12 } }}
            InputLabelProps={{ style: { fontSize: 12 } }}
          />
        </Grid>
      </Grid>
      <Grid item>
        <ToggleButtonGroup
          value={plotType}
          exclusive
          onChange={handleChangeChartType}
          aria-label="chart type"
        >
          <ToggleButton value="scatter" aria-label="scatter chart">
            <ScatterPlot />
          </ToggleButton>
          <ToggleButton value="line" aria-label="line chart">
            <ShowChart />
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid item>
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
        <TabPanel value={XYTabValue} label={'X'}>
          <Grid container spacing={1} mt={1}>
            <Grid container item spacing={1}>
              {/* TODO: hook these up */}
              <Grid item xs={6}>
                <TextField
                  label="Min"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
                />
              </Grid>
            </Grid>
            <Grid item>
              <FormControl
                disabled={XAxisSettings.scale === 'time'}
                sx={{ flexDirection: 'row', alignItems: 'center' }}
                // TODO: this needs to be enabled for all non-time X axes
                // and we need to make sure we set XAxisSettings.scale to time
                // when a user selects Time, and to linear (default) when they don't
              >
                <FormLabel id="x-scale-group-label" sx={{ mr: 1 }}>
                  Scale
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="x-scale-group-label"
                  name="x scale radio buttons group"
                  value={XScale}
                  onChange={(_, value) => handleChangeXScale(value)}
                >
                  <FormControlLabel
                    value="linear"
                    control={<Radio />}
                    label="Linear"
                  />
                  <FormControlLabel
                    value="logarithmic"
                    control={<Radio />}
                    label="Log"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid container item>
              <Autocomplete
                disablePortal
                freeSolo
                clearOnBlur
                id="select x axis"
                options={axisSelectionOptions}
                fullWidth
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                    setXAxisInputVal('');
                  } else {
                    setXAxisInputVal(newInputValue);
                  }
                }}
                value={XAxisInputVal}
                onChange={(_, newValue) => {
                  handleXAxisChange(newValue ?? '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search"
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ style: { fontSize: 12 } }}
                    InputProps={{
                      ...params.InputProps,
                      style: { fontSize: 12 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            {XAxis && (
              <Grid container item>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'inherit',
                    justifyContent: 'space-between',
                    border: 1,
                    padding: 1,
                  }}
                >
                  <Typography noWrap>{XAxis}</Typography>
                  <StyledClose onClick={() => handleXAxisChange('')} />
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        <TabPanel value={XYTabValue} label={'Y'}>
          <Grid container spacing={1} mt={1}>
            <Grid container item spacing={1}>
              {/* TODO: hook these up */}
              <Grid item xs={6}>
                <TextField
                  label="Min"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ style: { fontSize: 12 } }}
                  InputLabelProps={{ style: { fontSize: 12 } }}
                />
              </Grid>
            </Grid>
            <Grid item>
              <FormControl
                disabled={YAxesSettings.scale === 'time'}
                sx={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <FormLabel id="y-scale-group-label" sx={{ mr: 1 }}>
                  Scale
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="y-scale-group-label"
                  name="y scale radio buttons group"
                  value={YScale}
                  onChange={(_, value) => handleChangeYScale(value)}
                >
                  <FormControlLabel
                    value="linear"
                    control={<Radio />}
                    label="Linear"
                  />
                  <FormControlLabel
                    value="logarithmic"
                    control={<Radio />}
                    label="Log"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid container item>
              <FormControl fullWidth>
                <InputLabel
                  id="select data display channel"
                  sx={{ fontSize: 12 }}
                >
                  Data display channels
                </InputLabel>
                <Select
                  label="Data display channels"
                  value={YAxis}
                  onChange={(event) =>
                    handleYAxisChange((event.target.value as string) ?? '')
                  }
                  sx={{ fontSize: 12 }}
                >
                  {axisSelectionOptions.map((option) => {
                    return <MenuItem value={option}>{option}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid container item>
              <Autocomplete
                disablePortal
                freeSolo
                clearOnBlur
                id="select y axes"
                options={axisSelectionOptions}
                fullWidth
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                    setYAxisInputVal('');
                  } else {
                    setYAxisInputVal(newInputValue);
                  }
                }}
                value={YAxisInputVal}
                onChange={(_, newValue) => {
                  handleYAxisChange(newValue ?? '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search all channels"
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ style: { fontSize: 12 } }}
                    InputProps={{
                      ...params.InputProps,
                      style: { fontSize: 12 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            {YAxis && (
              <Grid container item>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'inherit',
                    justifyContent: 'space-between',
                    border: 1,
                    padding: 1,
                  }}
                >
                  <Typography noWrap>{YAxis}</Typography>
                  <StyledClose onClick={() => handleYAxisChange('')} />
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Grid>
    </Grid>
  );
};

export default PlotSettings;
