import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Session, SessionListItem, SessionResponse } from '../app.types';
import { ogApi } from './api';

const saveSession = async (session: Session): Promise<string> => {
  const queryParams = new URLSearchParams();
  queryParams.append('name', session.name);
  queryParams.append('summary', session.summary);
  queryParams.append('auto_saved', session.auto_saved.toString());

  return ogApi
    .post<string>(`/sessions`, session.session, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const useSaveSession = (): UseMutationResult<
  string,
  AxiosError,
  Session
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: Session) => saveSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionList'] });
    },
  });
};

const editSession = async (session: SessionResponse): Promise<string> => {
  const queryParams = new URLSearchParams();

  queryParams.append('name', session.name);
  queryParams.append('summary', session.summary);
  queryParams.append('auto_saved', session.auto_saved.toString());

  return ogApi
    .patch<string>(`/sessions/${session._id}`, session.session, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const useEditSession = (): UseMutationResult<
  string,
  AxiosError,
  SessionResponse
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: SessionResponse) => editSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionList'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
};

const deleteSession = async (session: SessionResponse): Promise<void> => {
  return ogApi
    .delete(`/sessions/${session._id}`)
    .then((response) => response.data);
};

export const useDeleteSession = (): UseMutationResult<
  void,
  AxiosError,
  SessionResponse
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: SessionResponse) => deleteSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionList'] });
    },
  });
};

const fetchSessionList = async (): Promise<SessionListItem[]> => {
  return ogApi.get(`/sessions/list`).then((response) => response.data);
};

export const useSessionList = (): UseQueryResult<
  SessionListItem[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['sessionList'],
    queryFn: () => {
      return fetchSessionList();
    },
  });
};

const fetchSession = async (
  sessionId: string | undefined
): Promise<SessionResponse> => {
  return ogApi.get(`/sessions/${sessionId}`).then((response) => response.data);
};

export const useSession = (
  session_id: string | undefined
): UseQueryResult<SessionResponse, AxiosError> => {
  return useQuery({
    queryKey: ['session', session_id],
    queryFn: () => {
      return fetchSession(session_id);
    },
    enabled: typeof session_id !== 'undefined',
  });
};
