import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { Session, SessionListItem, SessionResponse } from '../app.types';
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

const editSession = (
  apiUrl: string,
  session: SessionResponse
): Promise<string> => {
  const queryParams = new URLSearchParams();
  queryParams.append('name', session.name);
  queryParams.append('summary', session.summary);
  queryParams.append('auto_saved', session.auto_saved.toString());

  return axios
    .patch<string>(`${apiUrl}/sessions/${session._id}`, session.session, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useEditSession = (): UseMutationResult<
  string,
  AxiosError,
  SessionResponse
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  return useMutation(
    (session: SessionResponse) => editSession(apiUrl, session),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const deleteSession = (
  apiUrl: string,
  session: SessionResponse
): Promise<void> => {
  return axios
    .delete(`${apiUrl}/sessions/${session._id}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useDeleteSession = (): UseMutationResult<
  void,
  AxiosError,
  SessionResponse
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  return useMutation(
    (session: SessionResponse) => deleteSession(apiUrl, session),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchSessionList = (apiUrl: string): Promise<SessionListItem[]> => {
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

export const useSessionList = (): UseQueryResult<
  SessionListItem[],
  AxiosError
> => {
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
): Promise<SessionResponse> => {
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
): UseQueryResult<SessionResponse, AxiosError> => {
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
