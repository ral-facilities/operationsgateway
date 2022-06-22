import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { Record, Order, QueryParams, Channel, RecordRow } from '../app.types';
import { Column } from 'react-table';
import DateTimeInputBox from './dateTimeInput.component';

export interface RecordTableProps {
  resultsPerPage: number;
}

const RecordTable = React.memo(
  (props: RecordTableProps): React.ReactElement => {
    const { resultsPerPage } = props;

    const [page, setPage] = React.useState(0);
    const [sort, setSort] = React.useState<{
      [column: string]: Order;
    }>({});
    const [startDateRange, setStartDateRange] = React.useState<{
      fromDate?: string;
      toDate?: string;
    }>({});
    const [endDateRange, setEndDateRange] = React.useState<{
      fromDate?: string;
      toDate?: string;
    }>({});
    const [queryParams, setQueryParams] = React.useState<QueryParams>({
      page: page,
      sort: sort,
      startDateRange: startDateRange,
      endDateRange: endDateRange,
    });
    const [availableColumns, setAvailableColumns] = React.useState<Column[]>(
      []
    );
    const [parsedData, setParsedData] = React.useState<RecordRow[]>([]);

    const { data, isLoading: dataLoading } = useRecordsPaginated(queryParams);
    const { data: count, isLoading: countLoading } = useRecordCount();

    const constructColumns = (parsed: RecordRow[]): Column[] => {
      let myColumns: Column[] = [];
      let accessors: Set<string> = new Set<string>();

      parsed.forEach((recordRow: RecordRow) => {
        const keys = Object.keys(recordRow);

        for (let i = 0; i < keys.length; i++) {
          if (!accessors.has(keys[i])) {
            const newColumn: Column = {
              Header: keys[i], // Provide an actual header here when we have it
              accessor: keys[i],
            };
            myColumns.push(newColumn);
            accessors.add(keys[i]);
          }
        }
      });

      return myColumns;
    };

    const parseData = (data: Record[]): RecordRow[] => {
      let newData: RecordRow[] = [];

      data.forEach((record: Record) => {
        let recordRow: RecordRow = {
          id: record.id,
          shotNum: record.metadata.shotNum,
          timestamp: record.metadata.timestamp,
        };

        const keys = Object.keys(record.channels);
        keys.forEach((key: string) => {
          const channel: Channel = record.channels[key];
          const channelData = channel.data;
          recordRow[key] = channelData;
        });

        newData.push(recordRow);
      });

      setParsedData(newData);
      return newData;
    };

    React.useEffect(() => {
      if (data && !dataLoading) {
        const parsedData: RecordRow[] = parseData(data);
        const newAvailableColumns = constructColumns(parsedData);
        setAvailableColumns(newAvailableColumns);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, dataLoading]);

    React.useEffect(() => {
      setQueryParams({
        page: page,
        sort: sort,
        startDateRange: startDateRange,
        endDateRange: endDateRange,
      });
    }, [page, sort, startDateRange, endDateRange]);

    const onPageChange = (page: number) => {
      setPage(page);
    };

    const handleSort = (column: string, order: Order | null) => {
      let newSort = sort;
      if (order !== null) {
        newSort = {
          ...newSort,
          [column]: order,
        };
      } else {
        const { [column]: order, ...rest } = newSort;
        newSort = {
          ...rest,
        };
      }
      setSort(newSort);
    };

    const handleDateTimeChange = (
      label: 'startDateFilter' | 'endDateFilter',
      range: 'fromDate' | 'toDate',
      date: string
    ) => {
      label === 'startDateFilter'
        ? setStartDateRange({ ...startDateRange, [range]: date })
        : setEndDateRange({ ...endDateRange, [range]: date });
    };

    return (
      <div>
        <DateTimeInputBox onChange={handleDateTimeChange} />
        <Table
          data={parsedData}
          availableColumns={availableColumns}
          totalDataCount={count ?? 0}
          page={page}
          loadedData={!dataLoading}
          loadedCount={!countLoading}
          resultsPerPage={resultsPerPage}
          onPageChange={onPageChange}
          sort={sort}
          onSort={handleSort}
        />
      </div>
    );
  }
);

RecordTable.displayName = 'RecordTable';

export default RecordTable;
