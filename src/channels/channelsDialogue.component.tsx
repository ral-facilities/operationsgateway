import React from 'react';
import {
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { NavigateNext, Search } from '@mui/icons-material';
import { useChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';
import ChannelTree from './channelTree.component';

interface ChannelsDialogueProps {
  open: boolean;
  onClose: () => void;
}

export interface TreeNode {
  name: string;
  children: Record<string, TreeNode | FullChannelMetadata>;
}

const ChannelsDialogue = (props: ChannelsDialogueProps) => {
  const { open, onClose } = props;

  const { data: channels } = useChannels({
    select: (channels) => {
      const tree: TreeNode = { name: '/', children: {} };
      channels.forEach((channel) => {
        const { path } = channel;
        // split the path and remove any empty strings
        const splitPath = path.split('/').filter((el) => el);
        splitPath.reduce((prev, curr, currIndex) => {
          // init treenode if not already initialised
          if (!prev.children?.[curr]) {
            prev.children[curr] = {
              name: curr,
              children: {},
            };
          }
          const node = prev.children[curr] as TreeNode;
          // last item, so therefore is the channel
          if (currIndex === splitPath.length - 1) {
            node.children[channel.systemName] = channel;
          }
          // return the child node, so we drill deeper into the tree
          return node;
        }, tree);
      });

      return tree;
    },
  });

  const [currNode, setCurrNode] = React.useState('/');

  console.log('channel tree', channels);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle component="div">
        <Grid container columnSpacing={2}>
          <Grid item xs>
            <Typography variant="h6" component="h2">
              Data Channels
            </Typography>
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
            ></TextField>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent
        sx={{
          border: 'thin lightgrey',
          borderStyle: 'solid none',
          paddingTop: '8px !important',
          paddingBottom: '8px',
        }}
      >
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            key="1"
            color="inherit"
            component="span"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              return;
            }}
          >
            MUI
          </Link>
          <Link
            underline="hover"
            key="2"
            color="inherit"
            component="span"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              return;
            }}
          >
            Core
          </Link>
          <Typography key="3" color="text.primary">
            Breadcrumb
          </Typography>
        </Breadcrumbs>
      </DialogContent>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid item xs>
            <ChannelTree
              currNode={currNode}
              tree={channels ?? { name: '/', children: {} }}
              setCurrNode={setCurrNode}
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
            return;
          }}
        >
          Add Channels
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelsDialogue;
