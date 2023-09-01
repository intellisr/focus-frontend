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

  const train = async(input,output) =>{

    let inputTensor=tf.tensor3d(input);
    let outputTensor=tf.tensor1d(output);

    console.log(inputTensor.shape)

    let model = tf.sequential();

    let flat= tf.layers.flatten({
        inputShape:[125, 3],
    })

    let hidden = tf.layers.dense({
      units:125,
      activation:'relu',
    })

    let hidden2 = tf.layers.dense({
      units:125,
      activation:'sigmoid',
    })

    let outputlayer = tf.layers.dense({
      units:1,
      activation:'sigmoid'
    })


    //model.add(tf.layers.reshape({targetShape:[125,3], inputShape:[125,3]}))

    model.add(tf.layers.conv1d({kernelSize:2,filters:2,activation:'relu',inputShape:[125,3]}))
    model.add(tf.layers.maxPooling1d({poolSize:4}))

    model.add(flat);
    model.add(hidden);
    model.add(tf.layers.dropout({rate:0.5}))
    model.add(hidden2);
    model.add(outputlayer);


    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics:['accuracy']
    });

    model.summary()

    
    // Train for 5 epochs with batch size of 32.
   await model.fit(inputTensor, outputTensor, {
        epochs: 50,
        callbacks: {
            onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: Accuracy = ${log.acc}`)
        }
    });

    await model.save('localstorage://my-model');

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
