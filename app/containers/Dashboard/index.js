/**
 *
 * Dashboard
 *
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getDatabase, ref, set, get, child, onValue } from "firebase/database";
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';


export function Dashboard() {
  const [status, setStatus] = useState(0);
  const [data, setData] = useState({});
  const [fbdata, setFbdata] = useState({});
  const [users, setUsers] = useState({});

  useEffect(() => {

    const fetchOptions_ = Object.assign(
      {},
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    fetch(
      `http://localhost:8000/dashboard`,
      fetchOptions_,
    ).then(response => {
      console.log(response.json())
      //setData(response.json())
    });


    const dbRef = ref(getDatabase());
    get(child(dbRef, `alldata/lecture1`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        setFbdata(snapshot.val())
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

    get(child(dbRef, `usersLive/lecture1`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        setUsers(snapshot.val())
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

    const db = getDatabase();
    const starCountRef = ref(db, 'dashstatus');

    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data)
      setStatus(data)
    });


  }, []);

  return (
    <>
      {status == 0 ? (
        <div>
          <h2>Dashboard</h2>
          <div>
            <Box sx={{ width: '100%',marginLeft:10 }}>       
              <Stepper activeStep={10} alternativeLabel>
              <h4>Attendance List</h4>
                {Object.keys(users).map(key => (
                  <Step key={key}>
                    <StepLabel>{key}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </div>

          {Object.keys(fbdata).map(key => (
            <div>
              <h2>{key}</h2>
              <h3>{fbdata[key].Name}</h3>
              <h4>{fbdata[key].Passage}</h4>
              {/* 
              {Object.values(fbdata[key].QNA.questions).map(val=> (
                <>
                  {val.map(q=>(
                    <h5>{q} </h5>
                  ))}                
                </>
              ))}  */}
            </div>
          ))}

          {Object.keys(data).map(dataaas => (
            <div>
              <h2>{dataaas}</h2>
              <h3>{data[dataaas].Name}</h3>
              <h4>{data[dataaas].Passage}</h4>
            </div>
          ))}

        </div>
      ) : (
        <div style={{ display: 'flex', width: "100%", height: "30rem", justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ width: '70%' }}>
            <LinearProgress variant="determinate" value={status} />
          </Box>
        </div>
      )}</>
  );
}

Dashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(Dashboard);
