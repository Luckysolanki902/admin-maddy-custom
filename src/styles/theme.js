// theme.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  typography: {
    fontFamily: 'Jost, Arial',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff', // Vibrant blue for primary color
    },
  },
});

export default darkTheme;
