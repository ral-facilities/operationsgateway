import WindowReducer, {
  closeWindow,
  initialState,
  openImageWindow,
  openTraceWindow,
  TraceOrImageWindow,
} from './windowSlice';
import { DEFAULT_WINDOW_VARS } from '../../app.types';

describe('windowSlice', () => {
  describe('Reducer', () => {
    let state: typeof initialState;
    let uuidCount = 0;

    beforeEach(() => {
      state = initialState;

      jest
        .spyOn(global.crypto, 'randomUUID')
        .mockImplementation(() => `${++uuidCount}`);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('openTraceWindow creates a trace with the default options', () => {
      state = WindowReducer(
        state,
        openTraceWindow({ recordId: '1', channelName: 'TEST' })
      );
      expect(state).toEqual({
        [uuidCount]: {
          id: `${uuidCount}`,
          open: true,
          type: 'trace',
          recordId: '1',
          channelName: 'TEST',
          title: 'Trace TEST 1',
          ...DEFAULT_WINDOW_VARS,
        } satisfies TraceOrImageWindow,
      });
    });

    it('openImageWindow creates a image with the default options', () => {
      state = WindowReducer(
        state,
        openImageWindow({ recordId: '1', channelName: 'TEST' })
      );
      expect(state).toEqual({
        [uuidCount]: {
          id: `${uuidCount}`,
          open: true,
          type: 'image',
          recordId: '1',
          channelName: 'TEST',
          title: 'Image TEST 1',
          ...DEFAULT_WINDOW_VARS,
        } satisfies TraceOrImageWindow,
      });
    });

    it('closeWindow deletes the window from the state', () => {
      state = {
        'test uuid': {
          id: 'test uuid',
          open: true,
          type: 'trace',
          recordId: '1',
          channelName: 'TEST',
          title: 'Trace TEST 1',
          ...DEFAULT_WINDOW_VARS,
        },
      };
      state = WindowReducer(state, closeWindow('test uuid'));
      expect(state).toEqual({});
    });

    // Other actions are tested within components
  });
});
