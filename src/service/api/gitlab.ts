import { demoRequest } from '../request';

export function fetchGetProjectMrList({ params, projectId }: { params: any; projectId: number }) {
  return demoRequest<Api.Gitlab.MR[]>({
    method: 'get',
    params,
    url: `/projects/${projectId}/merge_requests`
  });
}

export function fetchGetMrDiffsList({ mrId, params, projectId }: { mrId: number; params: any; projectId: number }) {
  return demoRequest<Api.Auth.LoginToken>({
    method: 'get',
    params,
    url: `/projects/${projectId}/merge_requests/${mrId}/diffs`
  });
}
