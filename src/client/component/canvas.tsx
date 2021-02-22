import { Observable } from 'rxjs';
import * as handpose from '@tensorflow-models/handpose';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';

import './canvas.scss';

interface CanvasProp {
    eventBus: Observable<handpose.AnnotatedPrediction[]>
    videoBox: {width: number, height: number}
}
const CanvasComponent = (prop: CanvasProp) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  const [vectors, setVectors] = useState<{ x: number, y: number }[]>([]);
  const [path, setPath] = useState<string>();

  const createPath = (_vectors: { x: number, y: number }[]) => {
    let line = _vectors.reduce((p, vector, i) => {
      const prefix = i == 0 ? "M" : "L"
      p += `${prefix} ${vector.x},${vector.y} `;
      return p;
    }, "");
    return line.length > 0 ? line + "" : null;
  };

  useEffect(() => {
    console.log('subscribed')
    const subscription = prop.eventBus.subscribe(predictions => {
      if (canvasRef.current == null && predictions.length === 0) return;

      // const context = canvasRef.current.getContext('2d');
      // const canvasBox = { width: canvasRef.current.width, height: canvasRef.current.height };

      const annotations = predictions[0].annotations;
      const keys = Object.keys(annotations);
      const f = keys.reduce((p, key) => {
        p[key] = annotations[key].map(joint =>
          ({ x: joint[0], y: joint[1] })
        );
        return p;
      }, {} as any)

      const finger = f.indexFinger[3];

      // const point = {
      //   x: canvasBox.width - canvasBox.width * finger.x / prop.videoBox.width,
      //   y: canvasBox.height * finger.y / prop.videoBox.height
      // }

      // console.log('point', point, canvasBox, finger, predictions[0]);
      vectors.push(finger);
      setPath(createPath(vectors));
      setVectors(vectors);

      // context.fillStyle = 'rgb(255, 0, 0)';
      // context.fillRect(point.x, point.y, 1, 1);  // write
    })
    return () => {
      console.log('unsuscribed')
      subscription.unsubscribe();
    }
  }, []);

  const pathStyles: CSSProperties = useMemo(() => ({
    stroke: "#FFF",
    fill: "none",
    strokeWidth: 2,
  }), [])

  // const style = useMemo(() => ({...prop.videoBox, border:'solid 1px black', position: 'absolute', visibility: 'hidden' } as CSSProperties), [])
  return (
    <>
      {path &&
        <svg viewBox="0 0 640 480" width="640" height="480" xmlns="http://www.w3.org/2000/svg">
          <path style={pathStyles} d={path} />
        </svg>
      }
      {/*<canvas ref={canvasRef} style={style as CSSProperties}/>*/}
    </>
  )
}

export default CanvasComponent;
