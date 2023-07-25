import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { Session, SessionList } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { readSciGatewayToken } from '../parseTokens';

const saveSession = (apiUrl: string, session: Session): Promise<string> => {
  const queryParams = new URLSearchParams();
  queryParams.append('name', session.name);
  queryParams.append('summary', session.summary);
  queryParams.append('auto_saved', session.auto_saved.toString());

  return axios
    .post<string>(`${apiUrl}/sessions`, session.session_data, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useSaveSession = (): UseMutationResult<
  string,
  AxiosError,
  Session
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  return useMutation((session: Session) => saveSession(apiUrl, session), {
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
  });
};

const fetchSessionList = (apiUrl: string): Promise<SessionList[]> => {
  return axios
    .get(`${apiUrl}/sessions/list`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useSessionList = (): UseQueryResult<SessionList[], AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery(
    ['sessionList'],
    (params) => {
      return fetchSessionList(apiUrl);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchSession = (
  apiUrl: string,
  sessionId: string | undefined
): Promise<Session> => {
  return axios
    .get(`${apiUrl}/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useSession = (
  session_id: string | undefined
): UseQueryResult<Session, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery(
    ['session', session_id],
    (params) => {
      return fetchSession(apiUrl, session_id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
