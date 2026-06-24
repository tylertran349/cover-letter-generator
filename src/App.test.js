import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  post: jest.fn(),
}));

test('renders the cover letter form', () => {
  render(<App />);
  const heading = screen.getByText(/generate a cover letter/i);
  expect(heading).toBeInTheDocument();
});
