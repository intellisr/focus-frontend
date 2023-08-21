/**
 *
 * Train
 *
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getDatabase, ref, set,get,child } from "firebase/database";

import { forEach } from 'lodash';

import * as tf from '@tensorflow/tfjs'
//Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';

export function Train() {

  const [data, setData] = useState({});
  const [input, setInput] = useState([]);
  const [output, setOutput] = useState([]);

  useEffect(() => {
    getdata();
  }, []);

  useEffect(() => {
    if(Object.keys(data).length > 0){
      cleanData(data);
    } 
  }, [data]);

  useEffect(() => {
    if(output.length > 0){
      train(input,output);
    } 
  }, [output]);

  const getdata = () =>{
    const dbRef = ref(getDatabase());
    get(child(dbRef, `dataset`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        setData(snapshot.val())
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const cleanData = (object) => {
    let input=[]
    let output=[]
    for (const [key, value] of Object.entries(object)) {
      if(value.label == 'true'){
        output.push(1)
      }else{
        output.push(0)
      }

      let paras=value.data
      let col=[]
      paras.forEach(element => {
        let raw=[element['x'],element['y'],element['z']]
        col.push(raw)
      });

      input.push(col)
      
    }
    console.log(input, output);
    setInput(input)
    setOutput(output)
  }

  const train = (input,output) =>{

    let inputTensor=tf.tensor3d(input);
    let outputTensor=tf.tensor1d(output);

    console.log(inputTensor.shape)

    let model = tf.sequential();

    let hidden = tf.layers.dense({
      units:3,
      activation:'sigmoid',
      inputShape:[125, 3]
    })

    let outputlayer = tf.layers.dense({
      units:1,
      activation:'sigmoid'
    })

    model.add(hidden);
    model.add(outputlayer);
    model.compile({
      optimizer: 'sgd',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Train the model.
    function onBatchEnd(batch, logs) {
      console.log('Accuracy', logs.acc);
    }
    
    // Train for 5 epochs with batch size of 32.
    model.fit(inputTensor, outputTensor, {
       epochs: 5,
       batchSize: 32,
    });
  }

  return <div />;
}

Train.propTypes = {
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

export default compose(withConnect)(Train);
