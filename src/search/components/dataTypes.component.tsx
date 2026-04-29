import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import React from 'react';
import { SearchParams } from '../../app.types';
import { useAppSelector } from '../../state/hooks';
import { selectDataTypes } from '../../state/slices/configSlice';

export interface DataTypesProps {
  selectedDataTypes: NonNullable<SearchParams['dataTypes']>;
  changeSelectedDataTypes: React.Dispatch<
    React.SetStateAction<SearchParams['dataTypes']>
  >;
  searchParamsUpdated: () => void;
}

const DataTypes = (props: DataTypesProps): React.ReactElement => {
  const { selectedDataTypes, changeSelectedDataTypes, searchParamsUpdated } =
    props;

  const dataTypes = useAppSelector(selectDataTypes);

  return (
    <FormControl
      aria-label="select data types to display"
      component="fieldset"
      required
      variant="standard"
      error={selectedDataTypes.length === 0}
      sx={{ position: 'relative', mt: 1 }}
    >
      <Box display="flex" flexDirection="row" alignItems="center">
        <FormLabel component="legend" sx={{ float: 'left', mr: 2 }}>
          Data Types
        </FormLabel>
        <FormGroup row>
          {dataTypes?.map((dataType) => (
            <FormControlLabel
              key={dataType}
              control={
                <Checkbox
                  checked={selectedDataTypes.includes(dataType)}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    searchParamsUpdated();
                    changeSelectedDataTypes((prevDataTypes) => {
                      if (event.target.checked)
                        return prevDataTypes?.concat(dataType);
                      else return prevDataTypes?.filter((s) => s !== dataType);
                    });
                  }}
                  sx={{ p: 0 }}
                />
              }
              label={dataType}
            />
          ))}
        </FormGroup>
      </Box>
      {selectedDataTypes.length === 0 && (
        <FormHelperText sx={{ mt: 0 }}>
          Please select a data type
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default DataTypes;
