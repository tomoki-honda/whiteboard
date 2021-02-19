import * as React from 'react'
import { useEffect, useState } from 'react';

import { webgl } from '@tensorflow/tfjs-backend-webgl';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';

import './board.scss';

interface Finger {
  thumb?: { x: number, y: number }[];
  indexFinger?: { x: number, y: number }[];
  middleFinger?: { x: number, y: number }[];
  ringFinger?: { x: number, y: number }[];
  pinky?: { x: number, y: number }[];
}

const BoardPageComponent = () => {
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const [finger, setFinger] = useState<Finger>({});
  const [model, setModel] = useState<handpose.HandPose>();
  const [predictions, setProdictions] = useState<handpose.AnnotatedPrediction[]>();
  const [cnt, setCnt] = useState<number>(0);

  useEffect(() => {
    import('@tensorflow/tfjs-backend-webgl')
      .then(webgl => handpose.load())
      .then(_m => {
        setModel(_m);
      })
  }, []);

  useEffect(() => {
    if (!model) return;
    model.estimateHands(document.querySelector("video"))
      .then(p => setProdictions(p));
  }, [!!model, cnt]);

  useEffect(() => {
    if (predictions && predictions.length > 0) {
      const annotations = predictions[0].annotations;
      const keys = Object.keys(annotations);
      const f = keys.reduce((p, key) => {
        p[key] = annotations[key].map(joint => 
          ({ x: joint[0], y: joint[1] })
        );
        return p;
      }, {} as any)
      setFinger(f);
      if (points.length > 50) {
        setPoints([]);
      } else {
        setPoints([ ...points, f.indexFinger[3] ]);
      }
      // console.log(points);
    }
    setTimeout(() => setCnt(cnt+1), 5);
    // setPoint({ x: vector[0], y: vector[1] });
  }, [predictions])

  const getStyle = (p: { x: number, y: number }, color = "#F00") => {
    return {
      backgroundColor: color,
      left: p.x * 1.5,
      top: p.y * 1.5
    }
  }
  
  const fingerPoints = () => {
    return (
    <>
      {finger.thumb && finger.thumb.map((f, i) => {
          return <div key={i} className="finger point" style={getStyle(f, "#0FF")}></div>
      })}
      {finger.indexFinger && finger.indexFinger.map((f, i) => {
          return <div key={i} className="finger point" style={getStyle(f, "#0FF")}></div>
      })}
      {finger.middleFinger && finger.middleFinger.map((f, i) => {
          return <div key={i} className="finger point" style={getStyle(f, "#0FF")}></div>
      })}
      {finger.ringFinger && finger.ringFinger.map((f, i) => {
          return <div key={i} className="finger point" style={getStyle(f, "#0FF")}></div>
      })}
      {finger.pinky && finger.pinky.map((f, i) => {
          return <div key={i} className="finger point" style={getStyle(f, "#0FF")}></div>
      })}
    </>);
  }
  
  return (
    <div className="board">
      <Webcam onChange={() => console.log("change")} />
      {fingerPoints()}
      {points.length > 0 &&
        points.map((p, i) => 
          <div key={i} className="point" style={getStyle(p)}></div>
        )
      }
    </div>
  )
};

export default BoardPageComponent;