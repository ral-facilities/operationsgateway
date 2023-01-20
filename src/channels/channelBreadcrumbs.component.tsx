import { NavigateNext } from '@mui/icons-material';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import React from 'react';

type ChannelBreadcrumbsProps = {
  currNode: string;
  setCurrNode: (newNode: string) => void;
};

const ChannelBreadcrumbs = (props: ChannelBreadcrumbsProps) => {
  const { currNode, setCurrNode } = props;
  // special handling for '/' otherwise we get ['','']
  const nodePath = currNode === '/' ? [''] : currNode.split('/');
  console.log('currNode', currNode);
  console.log('nodePath', nodePath);

  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" />}
      aria-label="breadcrumb"
    >
      {nodePath.map((value, currIndex) => {
        const label = value.length ? value : 'All Channels';
        // final node, render as non-"link"
        if (currIndex === nodePath.length - 1) {
          return (
            <Typography key={label} color="text.primary">
              {label}
            </Typography>
          );
        } else {
          return (
            <Link
              key={label}
              component="span"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                setCurrNode(nodePath.slice(0, currIndex + 1).join('/'));
              }}
            >
              {label}
            </Link>
          );
        }
      })}
    </Breadcrumbs>
  );
};

export default ChannelBreadcrumbs;
