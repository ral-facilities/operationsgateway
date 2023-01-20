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

  const leaf = !('children' in nodes.children[Object.keys(nodes.children)[0]]);

  return (
    <List dense>
      {Object.keys(nodes.children).map((value) => {
        const labelId = `checkbox-list-label-${value}`;
        return (
          <ListItem key={value} disablePadding disableGutters>
            <ListItemButton
              onClick={() => {
                if (!leaf) {
                  setCurrNode(`${currNode !== '/' ? currNode : ''}/${value}`);
                } else {
                  if (value !== 'timestamp')
                    handleChannelChecked(value, nodes.children[value].checked);
                  // add to channels? open up side panel?
                }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={nodes.children[value].checked}
                  tabIndex={-1}
                  disableRipple
                  disabled={!leaf || value === 'timestamp'}
                  size="small"
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChannelTree;
