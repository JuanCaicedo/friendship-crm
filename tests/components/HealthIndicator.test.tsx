import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HealthIndicator } from '@/components/shared/HealthIndicator';

const theme = createTheme();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('HealthIndicator', () => {
  it('renders green indicator', () => {
    const { container } = render(<HealthIndicator status="green" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ backgroundColor: '#4CAF50' });
  });

  it('renders yellow indicator', () => {
    const { container } = render(<HealthIndicator status="yellow" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toHaveStyle({ backgroundColor: '#FFC107' });
  });

  it('renders red indicator', () => {
    const { container } = render(<HealthIndicator status="red" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toHaveStyle({ backgroundColor: '#F44336' });
  });

  it('renders with small size', () => {
    const { container } = render(<HealthIndicator status="green" size="small" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toHaveStyle({ width: '8px', height: '8px' });
  });

  it('renders with medium size by default', () => {
    const { container } = render(<HealthIndicator status="green" size="medium" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toHaveStyle({ width: '12px', height: '12px' });
  });

  it('renders with large size', () => {
    const { container } = render(<HealthIndicator status="green" size="large" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toHaveStyle({ width: '16px', height: '16px' });
  });

  it('has circular shape', () => {
    const { container } = render(<HealthIndicator status="green" />, { wrapper });
    const indicator = container.querySelector('div');
    expect(indicator).toHaveStyle({ borderRadius: '50%' });
  });
});

