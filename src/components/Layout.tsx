import React from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LayoutProps {
  children: React.ReactNode;
}

// Usar styled components en lugar de sx prop
const RootBox = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh'
});

const MainBox = styled(Box)({
  padding: 3,
  flex: 1
});

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <RootBox>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            IoT Building Simulator
          </Typography>
        </Toolbar>
      </AppBar>
      <MainBox component="main">
        {children}
      </MainBox>
    </RootBox>
  );
}; 