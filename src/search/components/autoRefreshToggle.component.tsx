import { FormControlLabel, Switch } from '@mui/material';
import React from 'react';

interface AutoRefreshToggleProps {
  onRequestRefresh: () => void;
}

const DEFAULT_AUTO_REFRESH_ENABLED = true;
const AUTO_REFRESH_INTERVAL_MS = 1000 * 60;

function AutoRefreshToggle({
  onRequestRefresh,
}: AutoRefreshToggleProps): JSX.Element {
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = React.useState(
    DEFAULT_AUTO_REFRESH_ENABLED
  );
  const autoRefreshTimeout = React.useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  React.useEffect(() => {
    if (autoRefreshTimeout.current) {
      clearInterval(autoRefreshTimeout.current);
    }

    if (isAutoRefreshEnabled) {
      autoRefreshTimeout.current = setInterval(() => {
        onRequestRefresh();
      }, AUTO_REFRESH_INTERVAL_MS);
    }

    return () => {
      if (autoRefreshTimeout.current) {
        clearInterval(autoRefreshTimeout.current);
      }
    };
  }, [isAutoRefreshEnabled, onRequestRefresh]);

  function toggleAutoRefresh(enabled: boolean) {
    setIsAutoRefreshEnabled(enabled);
  }

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isAutoRefreshEnabled}
          onChange={(_, checked) => toggleAutoRefresh(checked)}
        />
      }
      label="Auto refresh"
    />
  );
}

export default AutoRefreshToggle;
export { AUTO_REFRESH_INTERVAL_MS };
