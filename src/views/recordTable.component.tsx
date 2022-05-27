import React from "react";
import { useRecordCount, useRecordsPaginated } from "../api/records";
import Table from "../table/table.component";
import { QueryParams, recordColumns } from "../app.types";

const RecordTable = React.memo((): React.ReactElement => {
  const [page, setPage] = React.useState(0);
  const [queryParams, setQueryParams] = React.useState<QueryParams>({
    page: page + 1,
  });

  const { data, isLoading: dataLoading } = useRecordsPaginated(queryParams);
  const { data: count, isLoading: countLoading } = useRecordCount();

  const resultsPerPage = 10;

  React.useEffect(() => {
    setQueryParams({
      page: page + 1,
    });
  }, [page]);

  const onPageChange = (page: number) => {
    setPage(page);
  };

  return (
    <Table
      data={data ?? []}
      columns={recordColumns}
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
