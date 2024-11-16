// components/ThemeRegistry.js
"use client";

import { ThemeProvider } from "@mui/material/styles";
import darkTheme from "@/styles/theme";

export default function ThemeRegistry({ children }) {
  return (
    <ThemeProvider theme={darkTheme}>
      {children}
    </ThemeProvider>
  );
}
