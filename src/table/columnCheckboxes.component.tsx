import React from 'react';
import { Checkbox } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  selectSelectedChannels,
  selectColumn,
  deselectColumn,
} from '../state/slices/tableSlice';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';

const ColumnCheckboxes = React.memo((): React.ReactElement => {
  const { data: channels } = useChannels();

  const [filteredChannels, setFilteredChannels] = React.useState<
    FullChannelMetadata[]
  >([]);

  React.useEffect(() => {
    if (channels) {
      setFilteredChannels(
        channels.filter((channel) => channel.systemName !== 'timestamp')
      );
    } else {
      setFilteredChannels([]);
    }
  }, [channels]);

  const selectedChannels = useAppSelector((state) =>
    selectSelectedChannels(state, filteredChannels)
  );
  const dispatch = useAppDispatch();

  const onColumnOpen = React.useCallback(
    (column: string): void => {
      dispatch(selectColumn(column));
    },
    [dispatch]
  );

  const onColumnClose = React.useCallback(
    (column: string): void => {
      dispatch(deselectColumn(column));
    },
    [dispatch]
  );

  const handleColumnChecked = React.useCallback(
    (accessor: string, checked: boolean) => {
      checked ? onColumnOpen(accessor) : onColumnClose(accessor);
    },
    [onColumnClose, onColumnOpen]
  );

  const shouldBeChecked = React.useCallback(
    (columnAccessor: string): boolean => {
      const match = selectedChannels.filter((channel) => {
        return channel.systemName === columnAccessor;
      });

      return match && match.length > 0;
    },
    [selectedChannels]
  );

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredChannels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 42,
    overscan: 20,
  });

  const CheckboxRow = React.useCallback(
    (props: { channel: FullChannelMetadata }) => {
      const { channel } = props;
      const accessor = channel.systemName;
      const label = channel.userFriendlyName
        ? channel.userFriendlyName
        : channel.systemName
        ? channel.systemName
        : accessor;
      return (
        <>
          <label htmlFor={accessor}>{label}</label>
          <Checkbox
            onChange={(e) => handleColumnChecked(e.target.id, e.target.checked)}
            id={accessor}
            value={accessor}
            checked={accessor ? shouldBeChecked(accessor) : false}
            inputProps={{
              'aria-label': `${accessor} checkbox`,
            }}
          />
        </>
      );
    },
    [handleColumnChecked, shouldBeChecked]
  );

  return (
    <div
      aria-label="table checkboxes"
      style={{ overflow: 'auto', height: '150px' }}
      ref={parentRef}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {filteredChannels &&
          rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <CheckboxRow channel={filteredChannels[virtualRow.index]} />
            </div>
          ))}
      </div>
    </div>
  );
});

ColumnCheckboxes.displayName = 'ColumnCheckboxes';

export default ColumnCheckboxes;
