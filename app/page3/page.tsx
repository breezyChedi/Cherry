// app/page3/page.tsx

'use client';

import React from 'react';
import { Typography } from '@mui/material';

const Page3: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <Typography variant="h4">Page 3</Typography>
      <Typography>This is the content of Page 3.</Typography>
    </div>
  );
};

export default Page3;
