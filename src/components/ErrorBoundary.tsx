import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const ErrorContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(3)
}));

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <Alert 
            severity="error"
            action={
              <Button 
                onClick={() => window.location.reload()} 
                variant="outlined"
                size="small"
              >
                Recargar página
              </Button>
            }
          >
            {this.state.error?.message || 'Ha ocurrido un error'}
          </Alert>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
} 