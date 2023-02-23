import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
} from '@mui/material';
import { useChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';
import ChannelTree from './channelTree.component';
import ChannelBreadcrumbs from './channelBreadcrumbs.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  selectSelectedIds,
  updateSelectedColumns,
} from '../state/slices/tableSlice';
import { createSelector } from '@reduxjs/toolkit';
import ChannelMetadataPanel from './channelMetadataPanel.component';
import ChannelSearch from './channelSearch.component';

interface ChannelsDialogueProps {
  open: boolean;
  onClose: () => void;
}

export interface TreeNode {
  name: string;
  checked?: boolean; // undefined represents indeterminate checkbox
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
    const tree: TreeNode = { name: '/', children: {} };
    availableChannels.forEach((channel) => {
      const channelSelected = selectedIds.includes(channel.systemName);
      const { path } = channel;
      // split the path and remove any empty strings
      const splitPath = path.split('/').filter((el) => el);
      splitPath.reduce((prev, curr, currIndex) => {
        let node = prev.children[curr] as TreeNode;
        // init treenode if not already initialised
        if (!node) {
          node = prev.children[curr] = {
            name: curr,
            // when initialised there's by definition only 1 child so far, so use
            // that child's channelSelected property
            checked: channelSelected,
            children: {},
          };
        } else {
          // if node is already initialised, update the checked property of said node based on prev value and curr channel selected value
          if (
            (node.checked && !channelSelected) ||
            (!node.checked && channelSelected)
          )
            node.checked = undefined; // aka there's a mix of selected & unselected children i.e. indeterminate
        }
        // last item, so therefore is the channel
        if (currIndex === splitPath.length - 1) {
          node.children[channel.systemName] = {
            ...channel,
            checked: channelSelected,
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
    selectSelectedIds(state)
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
  const [displayedChannel, setDisplayedChannel] = React.useState<
    FullChannelMetadata | undefined
  >();

  const onChangeNode = React.useCallback((newNode: string) => {
    setCurrNode(newNode);
    setDisplayedChannel(undefined);
  }, []);

  const onSearchChange = React.useCallback((channel: FullChannelMetadata) => {
    setCurrNode(channel.path);
    setDisplayedChannel(channel);
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Grid container columnSpacing={2} alignItems="center">
        <Grid item xs>
          <DialogTitle>Data Channels</DialogTitle>
        </Grid>
        <Grid item xs pr={1}>
          <ChannelSearch
            channels={channels ?? []}
            onSearchChange={onSearchChange}
            currPathAndChannel={`${currNode}${
              displayedChannel ? `/${displayedChannel.systemName}` : ''
            }`}
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
        <ChannelBreadcrumbs currNode={currNode} setCurrNode={onChangeNode} />
      </DialogContent>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item xs>
            <ChannelTree
              currNode={currNode}
              tree={channelTree ?? { name: '/', children: {} }}
              setCurrNode={onChangeNode}
              handleChannelChecked={handleChannelChecked}
              handleChannelSelected={setDisplayedChannel}
            />
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid
            item
            xs
            sx={{
              overflow: 'auto',
              // 100vh - 2* dialogue padding + title + breadcrumbs + content padding + footer
              maxHeight:
                'calc(100vh - (2 * 32px + 72px + 42px + 2 * 20px + 53px))',
            }}
          >
            <ChannelMetadataPanel displayedChannel={displayedChannel} />
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
