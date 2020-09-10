import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import CssBaseline from "@material-ui/core/CssBaseline";

function Index() {

  const urls = [
    {name: "로그인", uri: "/sign-in"},
    {name: "회원가입", uri: "/sign-up"},
    {name: "그룹목록", uri: "/groups"},
    {name: "그룹상세", uri: "/groups/1"},
    {name: "서비스 추가", uri: "/services"},
    {name: "서비스 상세", uri: "/services/1"},
    {name: "홈", uri: "/home"},
  ]


  return (
    <Container maxWidth={"md"}>
      <CssBaseline />
      <Box my={4}>

        <Typography variant="h4" component="h1" gutterBottom>
          서비스 운영관리 풀랫폼 UI
        </Typography>

        {
          urls.map((url, index) => {
            return (
                <Link href={url.uri} color="secondary">
                  <Typography variant="h5"  gutterBottom>
                    {index + 1}. {url.name}
                  </Typography>
                </Link>
            )
          })
        }

      </Box>
    </Container>
  );
}

// Index.getInitialProps = ({ res, req }) => {
//   if (res) {
//     res.writeHead(301, {
//       Location: '/sign-in'
//     });
//     res.end();
//   }
//   return {};
// };

export default Index