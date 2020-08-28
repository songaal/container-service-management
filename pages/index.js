import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '../components/Link';
import Copyright from '../components/Copyright';

export default function Index() {
  return (
    <Container maxWidth={"xs"}>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          하이브리드 운영관리
        </Typography>
        
        <Link href="/server" color="secondary">
          서버 UI
        </Link>
        
        <br />

        <Link href="/process" color="secondary">
          프로세스 UI
        </Link>
        
        <Copyright />
      </Box>
    </Container>
  );
}
