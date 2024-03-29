import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { serverHandlers } from './serverHandlers';

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers, ...serverHandlers);
