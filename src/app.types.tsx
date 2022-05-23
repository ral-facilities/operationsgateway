import { Column } from "react-table";

export const MicroFrontendId = "scigateway";

export interface Record {
  shotId?: number;
  timestamp: string;
  activeArea: string;
  activeExperiment: string;
}

export const recordColumns: Column[] = [
  {
    Header: "Shot ID",
    accessor: "shotId", // accessor is the "key" in the data
  },
  {
    Header: "Time",
    accessor: "timestamp",
  },
  {
    Header: "Active Area",
    accessor: "activeArea",
  },
  {
    Header: "Active Experiment",
    accessor: "activeExperiment",
  },
];
