import { MicroFrontendId } from "../../app.types";

// parent app actions
export const CustomFrontendMessageType = `${MicroFrontendId}:api`;
export const RegisterRouteType = `${CustomFrontendMessageType}:register_route`;

export interface PluginRoute {
  section: string;
  link: string;
  displayName: string;
  admin?: boolean;
  hideFromMenu?: boolean;
  order: number;
}
