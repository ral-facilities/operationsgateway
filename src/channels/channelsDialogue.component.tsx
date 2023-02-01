import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';
import ChannelTree from './channelTree.component';
import ChannelBreadcrumbs from './channelBreadcrumbs.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  selectSelectedIdsIgnoreOrder,
  updateSelectedColumns,
} from '../state/slices/tableSlice';
import { createSelector } from '@reduxjs/toolkit';

interface ChannelsDialogueProps {
  open: boolean;
  onClose: () => void;
}

export interface TreeNode {
  name: string;
  checked: boolean;
  children: Record<
    string,
    TreeNode | (FullChannelMetadata & { checked: boolean })
  >;
}

/**
 * @returns A selector for a tree representing the channel hierarchy,
 * which is used by components in the channels folder
 * @params state - redux state - isn't actually used! (means we get nice memoisation from reselect)
 * @params availableChannels - array of all the channels the user can select
 * @params selectedIds - array of all the channels currently selected
 */
export const selectChannelTree = createSelector(
  (
    state: unknown,
    availableChannels: FullChannelMetadata[],
    selectedIds: string[]
  ) => availableChannels,
  (
    state: unknown,
    availableChannels: FullChannelMetadata[],
    selectedIds: string[]
  ) => selectedIds,
  (availableChannels, selectedIds) => {
    const tree: TreeNode = { name: '/', children: {}, checked: false };
    availableChannels.forEach((channel) => {
      const { path } = channel;
      // split the path and remove any empty strings
      const splitPath = path.split('/').filter((el) => el);
      splitPath.reduce((prev, curr, currIndex) => {
        // init treenode if not already initialised
        if (!prev.children?.[curr]) {
          prev.children[curr] = {
            name: curr,
            checked: false,
            children: {},
          };
        }
        const node = prev.children[curr] as TreeNode;
        // last item, so therefore is the channel
        if (currIndex === splitPath.length - 1) {
          node.children[channel.systemName] = {
            ...channel,
            checked: selectedIds.includes(channel.systemName),
          };
        }
        // return the child node, so we drill deeper into the tree
        return node;
      }, tree);
    });

    return tree;
  }
);

const ChannelsDialogue = (props: ChannelsDialogueProps) => {
  const { open, onClose } = props;

  const { data: channels } = useChannels();

  const appliedSelectedIds = useAppSelector((state) =>
    selectSelectedIdsIgnoreOrder(state)
  );

  const [selectedIds, setSelectedIds] = React.useState(appliedSelectedIds);

  React.useEffect(() => {
    setSelectedIds(appliedSelectedIds);
  }, [appliedSelectedIds]);

  const channelTree = useAppSelector((state) =>
    selectChannelTree(state, channels ?? [], selectedIds)
  );

  const dispatch = useAppDispatch();

  const onChannelSelect = React.useCallback((channel: string): void => {
    setSelectedIds((selectedIds) => [...selectedIds, channel]);
  }, []);

  const onChannelDeselect = React.useCallback((channel: string): void => {
    setSelectedIds((selectedIds) =>
      selectedIds.filter((colId) => colId !== channel)
    );
  }, []);

  const handleChannelChecked = React.useCallback(
    (channel: string, checked: boolean) => {
      checked ? onChannelDeselect(channel) : onChannelSelect(channel);
    },
    [onChannelDeselect, onChannelSelect]
  );

  const [currNode, setCurrNode] = React.useState('/');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Grid container columnSpacing={2} alignItems="center">
        <Grid item xs>
          <DialogTitle>Data Channels</DialogTitle>
        </Grid>
        <Grid item xs>
          <TextField
            size="small"
            label="Search data channels"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <DialogContent
        sx={{
          border: 'thin lightgrey',
          borderStyle: 'solid none',
          paddingTop: '8px !important',
          paddingBottom: '8px',
          overflowY: 'unset',
        }}
      >
        <ChannelBreadcrumbs currNode={currNode} setCurrNode={setCurrNode} />
      </DialogContent>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item xs>
            <ChannelTree
              currNode={currNode}
              tree={channelTree ?? { name: '/', children: {}, checked: false }}
              setCurrNode={setCurrNode}
              handleChannelChecked={handleChannelChecked}
            />
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs>
            Help / info
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() => {
            dispatch(updateSelectedColumns(selectedIds));
            onClose();
          }}
        >
          Add Channels
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelsDialogue;
