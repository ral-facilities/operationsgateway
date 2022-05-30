import React from 'react';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import Table from '../table/table.component';
import { Order, QueryParams, recordColumns } from '../app.types';

const RecordTable = React.memo((): React.ReactElement => {
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<{
    [column: string]: Order;
  }>({});
  const [queryParams, setQueryParams] = React.useState<QueryParams>({
    page: page,
    sort: {},
  });

  const { data, isLoading: dataLoading } = useRecordsPaginated(queryParams);
  const { data: count, isLoading: countLoading } = useRecordCount();

  const resultsPerPage = 10;

  React.useEffect(() => {
    setQueryParams({
      page: page,
      sort: sort,
    });
  }, [page, sort]);

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
      sort={sort}
      onSort={handleSort}
    />
  );
});

RecordTable.displayName = 'RecordTable';

export default RecordTable;
