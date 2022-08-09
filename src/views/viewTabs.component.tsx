import React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DataView from './dataView.component';
import PlotWindow from '../plotting/plotWindow.component';

type TabValue = 'Data' | 'Plots';

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

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(16),
}));

const ViewTabs = () => {
  const [value, setValue] = React.useState<TabValue>('Plots');

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="tabs">
          <StyledTab value="Data" label="Data" {...a11yProps('Data')} />
          <StyledTab value="Plots" label="Plots" {...a11yProps('Plots')} />
        </Tabs>
      </Box>
      <TabPanel value={value} label={'Data'}>
        <DataView />
      </TabPanel>
      <TabPanel value={value} label={'Plots'}>
        <PlotWindow />
      </TabPanel>
    </Box>
  );
};

export default ViewTabs;
