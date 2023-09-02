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
import { Chart } from "react-google-charts";


export const options = {
  chart: {
    title: "Chapter wise students attention level",
    subtitle: "Thease are the bla bla bla",
  },
};

export const dataxyx = [
  ["Year", "Sales", "Expenses", "Profit"],
  ["2014", 1000, 400, 200],
  ["2015", 1170, 460, 250],
  ["2016", 660, 1120, 300],
  ["2017", 1030, 540, 350],
];


export function Dashboard() {
  const [status, setStatus] = useState(0);
  const [data, setData] = useState({});
  const [fbdata, setFbdata] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {

    const getdata = async () => {

      const fetchOptions_ = Object.assign(
        {},
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      let response = await fetch(
        `http://localhost:8000/dashboard`,
        fetchOptions_,
      );

      const apidata = await response.json();

      let alldxd=[]
      let one=Object.values(apidata)[0]
      let temp=['Chapters']
      Object.keys(one).map((v)=>{
        temp.push(v)
      })
      alldxd.push(temp)


      Object.keys(apidata).map((key)=>{
        let newArr=[]
        newArr.push("Passage "+key)
        Object.values(apidata[key]).map((val)=>{
          newArr.push(val)
        })
        alldxd.push(newArr)
      })

      console.log(alldxd)
      setData(alldxd)

    }

    getdata();


    const dbRef = ref(getDatabase());
    get(child(dbRef, `alldata/lecture1`)).then((snapshot) => {
      if (snapshot.exists()) {

        const alld = snapshot.val()
        let allPass = []
        let mcq = {}
        for (let i = 1; i < Object.keys(alld).length; i++) {
          allPass.push(alld['passage-' + i])
          if (alld['passage-' + i]['QNA']) {
            mcq['q' + i] = alld['passage-' + i]['QNA']['questions'];
          }
        }

        setFbdata(allPass)
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
            <Box sx={{ width: '100%', marginLeft: 10 }}>
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
          <br/>
          <Box sx={{ width: '100%', marginLeft: 10 }}>
            {data && (
              <Chart
                chartType="Bar"
                width="100%"
                height="400px"
                data={data}
                options={options}
              />
            )}
          </Box>
          <br/>
          <Box sx={{ width: '100%', marginLeft: 10 }}>
            <h2>Theory</h2>
            {fbdata && fbdata.map((value, index) => (
              <div>
                <h3>{`Subsection ${index + 1} : ${value.Name}`}</h3>
                <h4>{value.Passage}</h4>
                {value.QNA && Object.values(value.QNA.questions).map((val, index) => (
                  <>
                    <h5>{`Q${index + 1}. ${val.question_statement}`}</h5>
                    <h6>{`1. Right Answer: ${val.answer}`} </h6>
                    {val.options.map((q, index) => (
                      <h6>{`${index + 2}. Wrong Answers: ${q}`} </h6>
                    ))}
                  </>
                ))}
              </div>
            ))}
          </Box>

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
