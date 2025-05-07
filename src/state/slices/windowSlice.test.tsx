import { DEFAULT_WINDOW_VARS } from '../../app.types';
import WindowReducer, {
  closeWindow,
  initialState,
  openImageWindow,
  openTraceWindow,
  openVectorWindow,
  WindowConfigType,
} from './windowSlice';

describe('windowSlice', () => {
  describe('Reducer', () => {
    let state: typeof initialState;
    let uuidCount = 0;

    beforeEach(() => {
      state = initialState;

      vi.spyOn(global.crypto, 'randomUUID').mockImplementation(
        // @ts-expect-error Format is intentionally different to uuid v4
        () => `${++uuidCount}`
      );
    });

    afterEach(() => {
      vi.clearAllMocks();
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
        } satisfies WindowConfigType,
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
        } satisfies WindowConfigType,
      });
    });

    it('openImageWindow creates a image with the default options (with bit depth)', () => {
      state = WindowReducer(
        state,
        openImageWindow({ recordId: '1', channelName: 'TEST', bitDepth: 12 })
      );
      expect(state).toEqual({
        [uuidCount]: {
          id: `${uuidCount}`,
          open: true,
          type: 'image',
          recordId: '1',
          channelName: 'TEST',
          title: 'Image TEST 1',
          bitDepth: 12,
          ...DEFAULT_WINDOW_VARS,
        } satisfies WindowConfigType,
      });
    });

    it('openImageWindow creates a float image with the default options', () => {
      state = WindowReducer(
        state,
        openImageWindow({ recordId: '1', channelName: 'TEST', isFloat: true })
      );
      expect(state).toEqual({
        [uuidCount]: {
          id: `${uuidCount}`,
          open: true,
          type: 'float_image',
          recordId: '1',
          channelName: 'TEST',
          title: 'Image TEST 1',
          ...DEFAULT_WINDOW_VARS,
        } satisfies WindowConfigType,
      });
    });

    it('openVectorWindow creates a vector with the default options', () => {
      state = WindowReducer(
        state,
        openVectorWindow({
          recordId: '1',
          channelName: 'TEST',
          labels: ['test'],
          units: 'test',
        })
      );
      expect(state).toEqual({
        [uuidCount]: {
          id: `${uuidCount}`,
          open: true,
          type: 'vector',
          recordId: '1',
          channelName: 'TEST',
          title: 'Vector TEST 1',
          labels: ['test'],
          units: 'test',
          ...DEFAULT_WINDOW_VARS,
        } satisfies WindowConfigType,
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
