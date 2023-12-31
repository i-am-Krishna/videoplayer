import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import * as faceapi from 'face-api.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  console.log(faceapi);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeFaceApi = async () => {
      console.log("loading")
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models')
      // await faceapi.nets.tinyYolov2.loadFromUri('/models')
      console.log("loaded")

    };
    initializeFaceApi(); 
  }, []); 


  const handleVideoPlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  };
 
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    const videoUrl = URL.createObjectURL(file);
    videoRef.current.src = videoUrl;
  };

  const detectFaces = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    console.log(detections)
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    detections.forEach((face) => {
      const box = new fabric.Rect({
        left: face.detection.box.x,
        top: face.detection.box.y,
        width: face.detection.box.width,
        height: face.detection.box.height,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 2,
      });
      console.log("Detecting faces  4")

      const text = new fabric.Text('Face', {
        left: face.detection.box.x,
        top: face.detection.box.y - 5,
        fontSize: 12,
        fill: 'red',
      });
      console.log("Detecting faces  5")

      // canvas.add(box, text);
      const group = new fabric.Group([box, text], { selectable: false });

      const scaleX = canvas.width / video.width;
      const scaleY = canvas.height / video.height;
  
      const options = {
        left: face.detection.box.x * scaleX,
        top: face.detection.box.y * scaleY,
      };
  
      group.set(options);
      canvas.add(group);
  
    });
    console.log("Faces detected")
  };

  useEffect(() => {
    if (isPlaying) {
      const intervalId = setInterval(() => {
        detectFaces();
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, [isPlaying]);

  return (
    <div>
    <div className='videoPlayer'>
    <video ref={videoRef} width="640" height="360" onLoadedData={() => detectFaces()} />
      <canvas ref={canvasRef} style={{ position: 'absolute'}} />
    </div>
      <br />
      <div className='tags'>
      <input type="file" onChange={handleVideoUpload} />
      <button onClick={handleVideoPlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
