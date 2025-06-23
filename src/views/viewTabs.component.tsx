import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import { useSession, useSessionList } from '../api/sessions';
import { SessionListItem } from '../app.types';
import ExportButton from '../export/exportButton.component';
import PlotList from '../plotting/plotList.component';
import DeleteSessionDialogue from '../session/deleteSessionDialogue.component';
import SessionDialogue from '../session/sessionDialogue.component';
import SessionsDrawer from '../session/sessionDrawer.component';
import SessionSaveButtons from '../session/sessionSaveButtons.component';
import DataView from './dataView.component';

type TabValue = 'Data' | 'Plots';

export const generateCode = (name: string): string => {
  const trimmed = name.trim().toLowerCase();
  const code = trimmed.replace(/\s+/g, '-');
  return code;
};
/* Returns a name avoiding duplicates by appending _copy_n for nth copy using code */
export const generateUniqueNameUsingCode = (
  name: string,
  code: string,
  existingCodes: string[],
  extraPrefixes: string = ''
): string => {
  let count = 1;
  let newName = name;
  let newCode = code;

  while (existingCodes.includes(newCode)) {
    newName = `${name}${extraPrefixes}_${count}`;
    newCode = `${code}${extraPrefixes}_${count}`;
    count++;
  }

  return newName;
};

export interface TabPanelProps<T> {
  children?: React.ReactNode;
  value: T | false;
  label: T | false;
  style?: React.CSSProperties;
}

export function TabPanel<T>({
  children,
  value,
  label,
  style,
  ...other
}: TabPanelProps<T>) {
  return (
    <div
      role="tabpanel"
      hidden={value !== label}
      id={`${label}-tabpanel`}
      aria-labelledby={`${label}-tab`}
      style={style}
      {...other}
    >
      {value === label && <Box>{children}</Box>}
    </div>
  );
}
export function a11yProps<T>(label: T) {
  return {
    id: `${label}-tab`,
    'aria-controls': `${label}-tabpanel`,
  };
}

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(16),
}));

const ViewTabs = () => {
  const [value, setValue] = React.useState<TabValue>('Data');

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
  };

  const [autoSaveSessionId, setAutoSaveSessionId] = React.useState<
    string | undefined
  >(undefined);

  // This useState manges the selected session id used for deleting and editing a session
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    string | undefined
  >(undefined);

  // This useState manages the current loaded session id
  const [loadedSessionId, setLoadedSessionId] = React.useState<
    string | undefined
  >(selectedSessionId);

  const [loadedSessionTimestamp, setLoadedSessionTimestamp] = React.useState<{
    timestamp: string | undefined;
    autoSaved: boolean | undefined;
  }>({ timestamp: undefined, autoSaved: undefined });

  const { data: sessionsList } = useSessionList();

  const { data: loadedSessionData } = useSession(loadedSessionId);

  const { data: selectedSessionData } = useSession(selectedSessionId);

  const [sessionSaveOpen, setSessionSaveOpen] = React.useState<boolean>(false);
  const [sessionEditOpen, setSessionEditOpen] = React.useState<boolean>(false);
  const [sessionDeleteOpen, setSessionDeleteOpen] =
    React.useState<boolean>(false);

  const [sessionName, setSessionName] = React.useState<string | undefined>(
    undefined
  );
  const [sessionSummary, setSessionSummary] = React.useState<string>('');

  const sessionCodes = React.useMemo(() => {
    return sessionsList
      ? sessionsList.map((session) => generateCode(session.name))
      : [];
  }, [sessionsList]);

  const onSessionEditOpen = (sessionData: SessionListItem) => {
    setSessionEditOpen(true);
    setSessionName(sessionData.name);
    setSessionSummary(sessionData.summary);
    setSelectedSessionId(sessionData._id);
  };

  const onSessionDeleteOpen = (sessionData: SessionListItem) => {
    setSessionDeleteOpen(true);
    setSelectedSessionId(sessionData._id);
  };

  const onSaveAsSessionClick = () => {
    setSessionSaveOpen(true);
    if (loadedSessionData) {
      setSessionName(
        generateUniqueNameUsingCode(
          loadedSessionData.name,
          generateCode(loadedSessionData.name),
          sessionCodes,
          '_copy'
        )
      );
      setSessionSummary(loadedSessionData.summary ?? '');
    }
  };
  const onChangeLoadedSessionTimestamp = (
    timestamp: string | undefined,
    autoSaved: boolean | undefined
  ) => {
    setLoadedSessionTimestamp({ timestamp, autoSaved });
  };

  const onDeleteLoadedSession = () => {
    setLoadedSessionId(undefined);
    setSelectedSessionId(undefined);
    setAutoSaveSessionId(undefined);
    setLoadedSessionTimestamp({
      timestamp: undefined,
      autoSaved: undefined,
    });
  };

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
        openSessionEdit={onSessionEditOpen}
        openSessionDelete={onSessionDeleteOpen}
        sessionsList={sessionsList}
        loadedSessionId={loadedSessionId}
        loadedSessionData={loadedSessionData}
        onChangeLoadedSessionId={setLoadedSessionId}
        onChangeLoadedSessionTimestamp={onChangeLoadedSessionTimestamp}
        onChangeAutoSaveSessionId={setAutoSaveSessionId}
      />

      <Box
        sx={{
          // minus off the sidebar width
          width: 'calc(100% - 220px)',
        }}
      >
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
            <StyledTab
              value="Data"
              label="Data"
              {...a11yProps<TabValue>('Data')}
            />
            <StyledTab
              value="Plots"
              label="Plots"
              {...a11yProps<TabValue>('Plots')}
            />
          </Tabs>
          <Box marginLeft="auto" sx={{ display: 'flex' }}>
            <SessionSaveButtons
              onSaveAsSessionClick={onSaveAsSessionClick}
              loadedSessionData={loadedSessionData}
              loadedSessionTimestamp={loadedSessionTimestamp}
              autoSaveSessionId={autoSaveSessionId}
              onChangeAutoSaveSessionId={setAutoSaveSessionId}
              sessionCodes={sessionCodes}
            />
            <ExportButton />
          </Box>
        </Box>
        <TabPanel value={value} label={'Data' satisfies TabValue}>
          <DataView sessionId={loadedSessionId} />
        </TabPanel>
        <TabPanel value={value} label={'Plots' satisfies TabValue}>
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
          sessionData={selectedSessionData}
          onChangeLoadedSessionId={setLoadedSessionId}
          onChangeAutoSaveSessionId={setAutoSaveSessionId}
          sessionCodes={sessionCodes}
        />
        <SessionDialogue
          open={sessionSaveOpen}
          onClose={() => setSessionSaveOpen(false)}
          sessionName={sessionName}
          sessionSummary={sessionSummary}
          onChangeSessionName={setSessionName}
          onChangeSessionSummary={setSessionSummary}
          onChangeLoadedSessionId={setLoadedSessionId}
          requestType="create"
          onChangeAutoSaveSessionId={setAutoSaveSessionId}
          sessionCodes={sessionCodes}
        />
        <DeleteSessionDialogue
          open={sessionDeleteOpen}
          onClose={() => setSessionDeleteOpen(false)}
          sessionData={selectedSessionData}
          loadedSessionId={loadedSessionId}
          onDeleteLoadedSession={onDeleteLoadedSession}
        />
      </Box>
    </Box>
  );
};

export default ViewTabs;
