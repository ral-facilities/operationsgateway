export const prefix = 'data-rfd';
export const dragHandle = (() => {
  const base = `${prefix}-drag-handle`;

  return {
    base,
    draggableId: `${base}-draggable-id`,
    contextId: `${base}-context-id`,
  };
})();

export const draggable = (() => {
  const base = `${prefix}-draggable`;
  return {
    base,
    contextId: `${base}-context-id`,
    id: `${base}-id`,
  };
})();

export const droppable = (() => {
  const base = `${prefix}-droppable`;
  return {
    base,
    contextId: `${base}-context-id`,
    id: `${base}-id`,
  };
})();

export const placeholder = {
  contextId: `${prefix}-placeholder-context-id`,
};

export const scrollContainer = {
  contextId: `${prefix}-scroll-container-context-id`,
};

export function getDroppableSelector(droppableId) {
  if (droppableId) {
    return `[${droppable.id}="${droppableId}"]`;
  }
  return `[${droppable.id}]`;
}

export function getHandleSelector(draggableId) {
  if (draggableId) {
    return `[${dragHandle.draggableId}="${draggableId}"]`;
  }
  return `[${dragHandle.draggableId}]`;
}

export function getDraggableSelector(draggableId) {
  if (draggableId) {
    return `[${draggable.id}="${draggableId}"]`;
  }
  return `[${draggable.id}]`;
}

export const formatDateTimeForApi = (datetime) => {
  return datetime.toLocaleString('sv-SE').replace(' ', 'T');
};

export const addInitialSystemChannels = (channels) => {
  cy.contains('Data Channels').click();

  cy.contains('system').click();

  channels.forEach((channel) => {
    cy.findByRole('checkbox', { name: channel }).check();
  });

  cy.contains('Add Channels').click();
};

export function getParamsFromUrl(url: string) {
  const paramsString = url.split('?')[1];
  const paramMap = new Map();
  paramsString.split('&').forEach(function (part) {
    const keyValPair = part.split('=');
    const key = keyValPair[0];
    const val = decodeURIComponent(keyValPair[1]);
    paramMap.set(key, val);
  });
  return paramMap;
}
