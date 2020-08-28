import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '../components/Link';
import Copyright from '../components/Copyright';
import Header from "../components/Header";
import Card from "@material-ui/core/Card";
import {CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";

export default function Index() {
  return (
      <React.Fragment>
          <Header/>
          <Container maxWidth={"lg"}>

              <Typography variant="h4" component="h1" gutterBottom>
                  프로세스
              </Typography>

              <Card>
                  <CardContent>




                  </CardContent>
              </Card>


          </Container>
      </React.Fragment>
  );
}
