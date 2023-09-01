/**
 *
 * Main
 *
 */

import React, { useEffect, useState, useRef } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Webcam from "react-webcam";
import * as tf from '@tensorflow/tfjs';
import * as faceapi from '@vladmandic/face-api';
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { getDatabase, ref, set,get,child } from "firebase/database";




var landmarkDetector;
var labeledFaceDescriptors;
var attentioModel;

export function Main() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models/";

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      }

      Promise.all([
        await faceapi.loadSsdMobilenetv1Model(MODEL_URL),
        await faceapi.loadFaceLandmarkModel(MODEL_URL),
        await faceapi.loadFaceRecognitionModel(MODEL_URL),
        landmarkDetector = await faceLandmarksDetection.createDetector(model, detectorConfig),
        attentioModel = await tf.loadLayersModel('localstorage://my-model'),
      ]).then(setModelLoaded(true));
    }
    loadModels();
  }, []);

  const webcamRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!modelLoaded) return;

    const detectFace = async () => {
      const imageSrc = webcamRef.current.getScreenshot({ width: 640, height: 480 });
      if (!imageSrc) return;
      return new Promise((resolve) => {
        imgRef.current.src = imageSrc;
        imgRef.current.onload = () => {
          try {
            faceRecog(imgRef.current)
            resolve();
          } catch (error) {
            console.log(error);
            resolve();
          }
        };
      });
    };

    let handle;
    const nextTick = () => {
      handle = requestAnimationFrame(async () => {
        await detectFace();
        nextTick();
      });
    };

    Promise.all([
      getDis()
    ]).then(nextTick());

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [modelLoaded]);


  async function faceRecog(image) {
    let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const context = canvasRef.current.getContext('2d');
    const maxDescriptorDistance = 0.6
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

    const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))
    results.map((bestMatch, i) => {
      const box = fullFaceDescriptions[i].detection.box
      context.drawImage(image, box._x, box._y, box._width+30, box._height+30,0, 0, 640, 480);
      let text = bestMatch.toString()
      let myArray = text.split(" ");
      let label=myArray[0]

      let tempImg = new Image();
      tempImg.src = canvasRef.current.toDataURL();
      let time=new Date().toUTCString();

      predict(tempImg,label,time)

    })

  }

  async function getDis(){
    const labels = ["Dewmi", "Dewmi", "Dewmi", "Lakindu", "Lakindu", "Lakindu", "Shenu", "Shenu", "Shenu","Sathira"]
    const urls = ["https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/dewmi'.jpeg?alt=media&token=fad76fd3-fa0c-4d1d-98c8-f63db2b53c8b",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/dewmi.jpeg?alt=media&token=16e4b6f3-b527-4a8f-8111-9ad151744698",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/dewmi_.jpeg?alt=media&token=dade6a4d-9819-4d10-ab14-9ee8409e17b7",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/lakindu'.jpeg?alt=media&token=e0f0e2a1-06e1-4ed8-9eee-2d09b625172f",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/lakindu.jpeg?alt=media&token=1cf1fa6e-5776-4f00-ab03-ec7150fc8124",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/lakindu_.jpeg?alt=media&token=c94bda95-103f-4146-9670-e88807eeaaf3",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/shenu'.jpeg?alt=media&token=6184f4ab-9acb-42ee-b22c-7f215a917b67",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/shenu.jpeg?alt=media&token=e41cdb19-14ec-47b0-9d97-fbb078699324",
      "https://firebasestorage.googleapis.com/v0/b/focus-77577.appspot.com/o/shenu_.jpeg?alt=media&token=0cc29f4b-acf2-472f-a0d5-95dfe6d4db39",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYQO0-TegcPSGM2sUY68Rw44QOii9E-qf32yLtA1sdQavHo5YOXXaZsSc0NhjTL2sfmE4&usqp=CAU"]

       labeledFaceDescriptors = await Promise.all(
        labels.map(async (label, index) => {
          // fetch image data from urls and convert blob to HTMLImage element
          const linkurl = urls[index];
          const img = await faceapi.fetchImage(linkurl)
  
          // detect the face with the highest score in the image and compute it's landmarks and face descriptor
          const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  
          if (!fullFaceDescription) {
            throw new Error(`no faces detected for ${label}`)
          }
  
          const faceDescriptors = [fullFaceDescription.descriptor]
          return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
        })
      )

      console.log(labeledFaceDescriptors);
  }

  async function predict(image,label,time){
    const faces = await landmarkDetector.estimateFaces(image);
    if(faces.length>0 && label != "unknown"){
      const data=filter(faces);

      let col=[]
      data.forEach(element => {
        let raw=[element['x'],element['y'],element['z']]
        col.push(raw)
      });

      let inputTensor=tf.tensor3d([col]);
      let res=attentioModel.predict(inputTensor).dataSync();

      console.log(res[0]);
      if(res[0]>0.2){
          console.log("attentioned")
          writeUserData(1, label,time)
      }else{
        console.log("Not attentioned") 
          writeUserData(0, label,time)     
      }

    }
    
  }

  function filter(faces){

    let face=faces[0];
    let keys=face.keypoints;
    let filteredData=[];
    keys.forEach(element => {
      if(element.name){
        filteredData.push(element);
      }
    });

    return filteredData;
  }

  function writeUserData(data, label,time) {
    let r = (Math.random() + 1).toString(36).substring(2);
    const lecture="ST2"
    
    const db = getDatabase();
    set(ref(db, 'usersLive/'+lecture+"/"+label+"/"+r), {
      data: data,
      time: time,
    });
  }

  

  return (
    <div>
      {console.log(images)}
      <h2>Real-time Face Recognition</h2>
      <div style={{ display: 'flex', width: "100%", height: "90%",justifyContent:'center' }}>
        <div style={{ alignItems: 'flex-start' }}>
          <canvas className="outputImage" height={480} width={640} ref={canvasRef} />
        </div>
        <div style={{ alignItems: 'flex-end' }}>
          <Webcam
            ref={webcamRef}
            className="webcam"
            mirrored
            screenshotFormat="image/jpeg"
          /></div>
      </div>
      <div id="canvas-container">
      <ul>
        {images.map((item) => (
          <li key={item[0]}><img src={item[1]}/></li>
        ))}
      </ul>
      </div>
      <img className="inputImage" alt="input" ref={imgRef} style={{ display: 'none' }}/>
    </div>
  );
}

Main.propTypes = {
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

export default compose(withConnect)(Main);
