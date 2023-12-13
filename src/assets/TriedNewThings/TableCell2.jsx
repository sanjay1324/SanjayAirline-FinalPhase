// TableCell2.jsx
import React from 'react';
import MuiTableCell from '@mui/material/TableCell';

const TableCell2 = ({ children, ...props }) => {
  return <MuiTableCell {...props}>{children}</MuiTableCell>;
};

export default TableCell2;
