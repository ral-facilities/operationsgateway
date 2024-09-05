import { render } from '@testing-library/react';
import functionsTokensJson from '../mocks/functionTokens.json';
import FunctionsHelp, { FunctionsHelpProps } from './functionsHelp.component';
describe('FunctionsDialog', () => {
  let props: FunctionsHelpProps;

  const createView = () => {
    return render(<FunctionsHelp {...props} />);
  };

  beforeEach(() => {
    props = {
      data: functionsTokensJson,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders help page correctly', async () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });
});
