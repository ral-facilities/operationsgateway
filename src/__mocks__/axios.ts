// TODO: move __mocks__ folder back to package root once facebook/create-react-app#7539 is fixed

const requests = {
  get: jest.fn((path) => {
    if (path === '/operationsgateway-settings.json') {
      return Promise.resolve({
        data: {
          apiUrl: 'api',
        },
      });
    } else {
      return Promise.resolve({
        data: {},
      });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
};

export default requests;
