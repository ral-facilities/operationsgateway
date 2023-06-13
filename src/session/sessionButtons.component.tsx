import React from 'react';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';

interface SessionButtonsProps {
  openSessionSave: () => void;
  sessionName: string | undefined;
  sessionSummary: string | undefined;
  setSessionName: (session: string | undefined) => void;
  setSessionSummary: (session: string | undefined) => void;
}

const SessionsButtons = (props: SessionButtonsProps) => {
  const {
    openSessionSave,
    sessionName,
    sessionSummary,
    setSessionName,
    setSessionSummary,
  } = props;
  const handleSaveAS = React.useCallback(() => {
    setSessionName(sessionSummary ? `${sessionSummary}_copy` : sessionName);
    setSessionSummary(sessionSummary);
    openSessionSave();
  }, [
    openSessionSave,
    sessionName,
    sessionSummary,
    setSessionName,
    setSessionSummary,
  ]);
  return (
    <Box
      sx={{
        paddingRight: '16px',
        paddingLeft: '8px',
        paddingTop: '8px',
        paddingbottom: '8px',
      }}
    >
      <Button variant="outlined" onClick={handleSaveAS}>
        Save as
      </Button>
    </Box>
  );
};

export default SessionsButtons;
