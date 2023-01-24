import {
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React from 'react';
import { TreeNode } from './channelsDialogue.component';

type ChannelTreeProps = {
  currNode: string;
  tree: TreeNode;
  setCurrNode: (newNode: string) => void;
  handleChannelChecked: (channel: string, checked: boolean) => void;
};

const ChannelTree = (props: ChannelTreeProps) => {
  const { currNode, tree, setCurrNode, handleChannelChecked } = props;

  const nodes = currNode
    .split('/')
    .filter((el) => el)
    .reduce((prev, curr) => prev.children?.[curr] as TreeNode, tree);

  return (
    <List dense>
      {Object.entries(nodes.children).map(([key, value]) => {
        const leaf = !('children' in value);
        const labelId = `checkbox-list-label-${key}`;
        return (
          <ListItem key={key} disablePadding disableGutters>
            <ListItemButton
              onClick={() => {
                if (!leaf) {
                  setCurrNode(`${currNode !== '/' ? currNode : ''}/${key}`);
                } else {
                  if (key !== 'timestamp')
                    handleChannelChecked(key, value.checked);
                  // add to channels? open up side panel?
                }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={value?.checked}
                  tabIndex={-1}
                  disableRipple
                  disabled={!leaf || key === 'timestamp'}
                  size="small"
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value?.name ?? key} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChannelTree;
