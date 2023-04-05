import React from 'react';
import { Search } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  TextField,
  Typography,
  // createFilterOptions,
  InputAdornment,
} from '@mui/material';
import { ExperimentParams } from '../../app.types';
import { ScienceOutlined } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';

export interface ExperimentProps {
  experiments: ExperimentParams[];
  onExperimentChange: (experiment: ExperimentParams | null) => void;
  experiment: ExperimentParams | null;
}

const ExperimentPopup = (props: ExperimentProps): React.ReactElement => {
  const { experiments, onExperimentChange, experiment } = props;

  const [value, setValue] = React.useState<ExperimentParams | null>(null);
  const [inputValue, setInputValue] = React.useState(
    experiment?.experiment_id ?? ''
  );

  const renderOptions = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: ExperimentParams
  ) => {
    return (
      <li {...props} key={option._id}>
        {option.experiment_id}
      </li>
    );
  };
  return (
    <div
      style={{
        padding: 5,
      }}
    >
      <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
        Select your experiment
      </Typography>
      <Divider
        sx={{
          marginBottom: 2,
          borderBottomWidth: 2,
          backgroundColor: 'black',
          width: '90%',
        }}
      />
      <Grid container spacing={1}>
        <Grid item xs={15}>
          <Autocomplete
            fullWidth
            value={value}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) =>
              setInputValue(newInputValue)
            }
            size="small"
            options={experiments}
            getOptionLabel={(option) => option.experiment_id}
            blurOnSelect
            onChange={(event: unknown, newValue: ExperimentParams | null) => {
              if (newValue) onExperimentChange(newValue);
              setValue(newValue);
            }}
            renderOption={renderOptions}
            renderInput={(params) => (
              <TextField
                name="experiment id"
                {...params}
                label="Select your experiment"
                InputProps={{
                  ...params.InputProps,
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
      </Grid>
    </div>
  );
};

const Experiment = (props: ExperimentProps): React.ReactElement => {
  const { experiment } = props;
  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        aria-label={`${isOpen ? 'close' : 'open'} experiment search box`}
        sx={{
          border: '1.5px solid',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 5,
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onClick={() => toggle(!isOpen)}
      >
        <ScienceOutlined sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography noWrap>Experiment</Typography>
          <Typography noWrap variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {experiment ? `ID ${experiment.experiment_id}` : 'Select'}
          </Typography>
        </div>
      </Box>
      {isOpen && (
        <Box
          role="dialog"
          sx={{
            border: '1px solid',
            position: 'absolute',
            top: 55,
            zIndex: 2,
            backgroundColor: '#ffffff',
            width: 300,
          }}
          ref={popover}
        >
          <ExperimentPopup {...props} />
        </Box>
      )}
    </Box>
  );
};

Experiment.displayName = 'Experiment';

export default Experiment;
