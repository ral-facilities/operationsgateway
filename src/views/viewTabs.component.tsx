import React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DataView from './dataView.component';
import PlotList from '../plotting/plotList.component';
import SessionSaveButtons from '../session/sessionSaveButtons.component';
import SessionsDrawer from '../session/sessionDrawer.component';
import { useSession, useSessionList } from '../api/sessions';
import { SessionList } from '../app.types';
import SessionDialogue from '../session/sessionDialogue.component';
import DeleteSessionDialogue from '../session/deleteSessionDialogue.component';

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

  const [sessionId, setSessionId] = React.useState<string | undefined>(
    undefined
  );

  const [selectedSessionId, setSelectedSessionId] = React.useState<
    string | undefined
  >(sessionId);

  const [selectedSessionTimestamp, setSelectedSessionTimestamp] =
    React.useState<{
      timestamp: string | undefined;
      autoSaved: boolean | undefined;
    }>({ timestamp: undefined, autoSaved: undefined });

  const { data: sessionsList, refetch: refetchSessionsList } = useSessionList();

  const { data: sessionData } = useSession(sessionId);
  const { data: selectedSessionData } = useSession(selectedSessionId);

  const [sessionSaveOpen, setSessionSaveOpen] = React.useState<boolean>(false);
  const [sessionEditOpen, setSessionEditOpen] = React.useState<boolean>(false);
  const [sessionDeleteOpen, setSessionDeleteOpen] =
    React.useState<boolean>(false);

  const [sessionName, setSessionName] = React.useState<string | undefined>(
    undefined
  );
  const [sessionSummary, setSessionSummary] = React.useState<string>('');

  const onSessionEditOpen = (sessionData: SessionList) => {
    setSessionEditOpen(true);
    setSessionName(sessionData.name);
    setSessionSummary(sessionData.summary);
    setSessionId(sessionData._id);
  };

  const onSessionDeleteOpen = (sessionData: SessionList) => {
    setSessionDeleteOpen(true);
    setSessionId(sessionData._id);
  };

  const onSaveAsSessionClick = () => {
    setSessionSaveOpen(true);
    if (selectedSessionData) {
      setSessionName(`${selectedSessionData.name}_copy`);
      setSessionSummary(selectedSessionData.summary ?? '');
    }
  };
  const onChangeSelectedSessionTimestamp = (
    timestamp: string | undefined,
    autoSaved: boolean | undefined
  ) => {
    setSelectedSessionTimestamp({ timestamp, autoSaved });
  };

  React.useEffect(() => {
    if (!sessionEditOpen) {
      setSessionName(undefined);
      setSessionSummary('');
    }
  }, [sessionEditOpen]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
      }}
    >
      <SessionsDrawer
        openSessionSave={() => {
          setSessionSaveOpen(true);
        }}
        openSessionEdit={onSessionEditOpen}
        openSessionDelete={onSessionDeleteOpen}
        sessionsList={sessionsList}
        selectedSessionId={selectedSessionId}
        onChangeSelectedSessionId={setSelectedSessionId}
        onChangeSelectedSessionTimestamp={onChangeSelectedSessionTimestamp}
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
            <SessionSaveButtons
              sessionId={selectedSessionId}
              onSaveAsSessionClick={onSaveAsSessionClick}
              selectedSessionData={selectedSessionData}
              selectedSessionTimestamp={selectedSessionTimestamp}
              refetchSessionsList={refetchSessionsList}
            />
          </Box>
        </Box>
        <TabPanel value={value} label={'Data'}>
          <DataView sessionId={selectedSessionId} />
        </TabPanel>
        <TabPanel value={value} label={'Plots'}>
          <PlotList />
        </TabPanel>
        <SessionDialogue
          open={sessionEditOpen}
          onClose={() => setSessionEditOpen(false)}
          sessionName={sessionName}
          sessionSummary={sessionSummary}
          onChangeSessionName={setSessionName}
          onChangeSessionSummary={setSessionSummary}
          requestType="edit"
          sessionData={sessionData}
          onChangeSelectedSessionId={setSelectedSessionId}
          refetchSessionsList={refetchSessionsList}
        />
        <SessionDialogue
          open={sessionSaveOpen}
          onClose={() => setSessionSaveOpen(false)}
          sessionName={sessionName}
          sessionSummary={sessionSummary}
          onChangeSessionName={setSessionName}
          onChangeSessionSummary={setSessionSummary}
          onChangeSelectedSessionId={setSelectedSessionId}
          requestType="create"
          refetchSessionsList={refetchSessionsList}
        />
        <DeleteSessionDialogue
          open={sessionDeleteOpen}
          onClose={() => setSessionDeleteOpen(false)}
          sessionData={sessionData}
          refetchSessionsList={refetchSessionsList}
        />
      </Box>
    </Box>
  );
};

export default ViewTabs;
