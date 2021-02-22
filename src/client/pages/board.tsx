import * as React from 'react'
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';

import * as handpose from '@tensorflow-models/handpose';

import './board.scss';
import { Subject } from 'rxjs';

import Canvas from '../component/canvas'

interface Finger {
  thumb?: { x: number, y: number }[];
  indexFinger?: { x: number, y: number }[];
  middleFinger?: { x: number, y: number }[];
  ringFinger?: { x: number, y: number }[];
  pinky?: { x: number, y: number }[];
}

const BoardPageComponent = () => {
  const eventBus = useMemo<Subject<handpose.AnnotatedPrediction[]>>(() => new Subject(), [])
  const [videoBox, setVideoBox] = useState<{width: number, height: number}>();
  const [viewBox, setViewBox] = useState<{width: number, height: number}>();
  const videoContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!videoContainerRef) return;
    (async () =>  {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' }
      })
      await import('@tensorflow/tfjs-backend-webgl');
      const m = await handpose.load();
      const video = document.createElement('video');
      video.srcObject = stream;
      // video.style.position = 'absolute';
      video.style.transform = 'scaleX(-1)';
      video.style.opacity = '0.5';
      // document.body.appendChild(video);
      const container = videoContainerRef.current;
      container.innerHTML = "";
      container.appendChild(video);

      const reflectPoint = async () => {
        const pos = await m.estimateHands(video)
        if (pos.length > 0) {
          eventBus.next(pos);
        }
        // setTimeout(reflectPoint, 500)
        requestAnimationFrame(reflectPoint)
      }
      video.onloadedmetadata = () => {
        const _viewRatio = 1.5;
        video.width = video.videoWidth * _viewRatio;
        video.height = video.videoHeight * _viewRatio;
        
        video.play();
        setVideoBox({width: video.videoWidth, height: video.videoHeight})
        setViewBox({width: video.width, height: video.height})
        console.log({width: video.videoWidth, height: video.videoHeight}, {width: video.width, height: video.height})
      }
      video.onloadeddata = reflectPoint;
    })()
  }, [!!videoContainerRef]);

  return (
    <div className="board">
      <div className="body" style={viewBox && { width: viewBox.width, height: viewBox.height }}>
        <div className="video-container" ref={videoContainerRef}>Now Loading...</div>
        {videoBox && viewBox && <Canvas eventBus={eventBus} videoBox={videoBox} viewBox={viewBox} />}
      </div>
    </div>
  )
};

export default BoardPageComponent;
