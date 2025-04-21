import { useRequest } from '@sa/hooks';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { fetchGetMrDiffsList, fetchGetProjectMrList } from '@/service/api';

dayjs.extend(utc);

const Component = () => {
  const [files, setFiles] = useState([]);
  const [filterDate, setFilterDate] = useState(dayjs());

  const { response, run } = useRequest(fetchGetProjectMrList, { manual: true });

  const fetchData = useCallback(() => {
    run({
      params: {
        not: { labels: 'L::RELEASE' },
        order_by: 'merged_at',
        per_page: 100,
        scope: 'all',
        sort: 'asc',
        state: 'merged',
        target_branch: 'develop',
        updated_after: filterDate.startOf('day').utc().format(),
        updated_before: filterDate.endOf('day').utc().format()
      },
      projectId: 500
    });
  }, [filterDate, run]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mrIds = useMemo(() => response?.data?.map(item => item.iid), [response]);

  const fetchAllMrDiffs = useCallback(async () => {
    if (mrIds?.length) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const promises = mrIds.map(mrId =>
          fetchGetMrDiffsList({
            mrId,
            params: { per_page: 30 },
            projectId: 500
          })
        );

        const results = await Promise.all(promises);

        setFiles(
          results
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .flatMap((result, index) =>
              // eslint-disable-next-line complexity
              result.response.data.map((file: any) => {
                return {
                  ...file,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  merge_user_avatar_url: response?.data?.[index]?.merge_user?.avatar_url,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  merge_user_username: response?.data?.[index]?.merge_user?.username,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  merged_at: response?.data?.[index]?.merged_at,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  mr_iid: response?.data?.[index]?.iid,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  mr_title: response?.data?.[index]?.title,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  web_url: response?.data?.[index]?.web_url
                };
              })
            )
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ?.filter(
              (item: any) =>
                item.merge_user_username !== 'locdp' &&
                !item.old_path.startsWith('src/modules/') &&
                !item.old_path.startsWith('src/pages/')
            )
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ?.reduce((acc, curr) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const existingPath = acc.find(item => item.old_path === curr.old_path);
              if (existingPath) {
                existingPath.children.push({
                  merge_user_avatar_url: curr.merge_user_avatar_url,
                  merge_user_username: curr.merge_user_username,
                  merged_at: curr.merged_at,
                  mr_iid: curr.mr_iid,
                  mr_title: curr.mr_title,
                  web_url: curr.web_url
                });
              } else {
                acc.push({
                  children: [
                    {
                      merge_user_avatar_url: curr.merge_user_avatar_url,
                      merge_user_username: curr.merge_user_username,
                      merged_at: curr.merged_at,
                      mr_iid: curr.mr_iid,
                      mr_title: curr.mr_title,
                      web_url: curr.web_url
                    }
                  ],
                  old_path: curr.old_path
                });
              }
              return acc;
            }, [])
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ?.toSorted((a, b) => a.old_path.localeCompare(b.old_path)) ?? []
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      setFiles([]);
    }
  }, [mrIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAllMrDiffs();
  }, [mrIds]);

  return (
    <ACard className="card-wrapper">
      <ASpace
        className="w-full"
        direction="vertical"
      >
        <ADatePicker
          allowClear={false}
          value={filterDate}
          onChange={setFilterDate}
        />

        <AList
          bordered
          dataSource={files}
          size="large"
          renderItem={item => (
            <AList.Item>
              <ASpace direction="vertical">
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <h1 className="text-lg font-bold">{item?.old_path}</h1>
                <ASpace wrap>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  {item?.children?.map((child: any) => (
                    <a
                      href={`${child?.web_url}/diffs`}
                      key={child?.mr_iid}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ACard>
                        <ASpace>
                          <AAvatar
                            size="large"
                            src={child?.merge_user_avatar_url}
                          />
                          <span>{child?.mr_title}</span>
                          <span className="text-sm text-gray-500">{dayjs(child?.merged_at).format('hh:mm A')}</span>
                          <ACheckbox />
                        </ASpace>
                      </ACard>
                    </a>
                  ))}
                </ASpace>
              </ASpace>
            </AList.Item>
          )}
        />
      </ASpace>
    </ACard>
  );
};

export default Component;
