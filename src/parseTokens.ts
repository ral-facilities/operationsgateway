// we return the payload as a string rather than JSON.parse-ing it
// so that callers can inform TypeScript the type of their payload

import { MicroFrontendToken } from './app.types';

export type SciGatewayToken = string | null;

export const readSciGatewayToken = (): SciGatewayToken => {
  const token = localStorage.getItem(MicroFrontendToken);
  return token;
};
