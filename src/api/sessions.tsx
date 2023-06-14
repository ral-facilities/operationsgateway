import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { SaveSessionResponse, Session } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { readSciGatewayToken } from '../parseTokens';

const saveSession = (
  apiUrl: string,
  session: Session
): Promise<SaveSessionResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('name', session.name);
  queryParams.append('summary', session.summary);
  queryParams.append('auto_saved', session.auto_saved.toString());

  return axios
    .post<SaveSessionResponse>(`${apiUrl}/sessions`, session.session_data, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useSaveSession = (): UseMutationResult<
  SaveSessionResponse,
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
