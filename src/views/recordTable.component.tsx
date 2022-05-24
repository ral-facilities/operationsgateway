import React from "react";
import { Column } from "react-table";
import { useRecordCount, useRecordsPaginated } from "../api/records";
import Table from "../table/table.component";
import { recordColumns } from "../app.types";

const RecordTable = React.memo((): React.ReactElement => {
  const [page, setPage] = React.useState(0);

  const { data, isLoading: dataLoading } = useRecordsPaginated(page + 1);
  const { data: count, isLoading: countLoading } = useRecordCount();

  const resultsPerPage = 10;

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const columns: Column[] = React.useMemo(() => recordColumns, []);

  return (
    <Table
      data={data ?? []}
      columns={columns}
      totalDataCount={count ?? 0}
      page={page}
      loadedData={!dataLoading}
      loadedCount={!countLoading}
      resultsPerPage={resultsPerPage}
      onPageChange={onPageChange}
    />
  );
});

RecordTable.displayName = "RecordTable";

export default RecordTable;
