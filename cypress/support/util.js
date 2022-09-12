export const prefix = 'data-rbd';
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
