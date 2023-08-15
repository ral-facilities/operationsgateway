import React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DataView from './dataView.component';
import PlotList from '../plotting/plotList.component';
import SessionSaveButtons from '../session/sessionSaveButtons.component';
import SaveSessionDialogue from '../session/saveSessionDialogue.component';
import SessionsDrawer from '../session/sessionDrawer.component';
import { useSessionList } from '../api/sessions';

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
  const [value, setValue] = React.useState<TabValue>('Data');

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
  };

  // This useState manages the current loaded session id
  const [loadedSessionId, setLoadedSessionId] = React.useState<
    string | undefined
  >(undefined);

  const { data: sessionsList, refetch: refetchSessionsList } = useSessionList();

  const [sessionSaveOpen, setSessionSaveOpen] = React.useState<boolean>(false);

  const [sessionName, setSessionName] = React.useState<string | undefined>(
    undefined
  );
  const [sessionSummary, setSessionSummary] = React.useState<string>('');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        // SG header + SG footer
        height: `calc(100vh - (64px + 32px))`,
      }}
    >
      <SessionsDrawer
        openSessionSave={() => {
          setSessionSaveOpen(true);
        }}
        sessionsList={sessionsList}
        loadedSessionId={loadedSessionId}
        onChangeLoadedSessionId={setLoadedSessionId}
      />

      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <Tabs value={value} onChange={handleChange} aria-label="view tabs">
            <StyledTab value="Data" label="Data" {...a11yProps('Data')} />
            <StyledTab value="Plots" label="Plots" {...a11yProps('Plots')} />
          </Tabs>
          <Box marginLeft="auto">
            <SessionSaveButtons />
          </Box>
        </Box>
        <TabPanel value={value} label={'Data'}>
          <DataView sessionId={loadedSessionId} />
        </TabPanel>
        <TabPanel value={value} label={'Plots'}>
          <PlotList />
        </TabPanel>
        <SaveSessionDialogue
          open={sessionSaveOpen}
          onClose={() => setSessionSaveOpen(false)}
          sessionName={sessionName}
          sessionSummary={sessionSummary}
          onChangeSessionName={setSessionName}
          onChangeSessionSummary={setSessionSummary}
          onChangeLoadedSessionId={setLoadedSessionId}
          refetchSessionsList={refetchSessionsList}
        />
      </Box>
    </Box>
  );
};

export default ViewTabs;
