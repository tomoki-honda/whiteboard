import { Observable } from 'rxjs';
import * as handpose from '@tensorflow-models/handpose';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { Vector } from '../interface/vector';

import './canvas.scss';
import ButtonComponent from './canvas/button';
import { BSpline } from './canvas/bspline';

interface VectorEx extends Vector {
  ts: number;
}

interface CanvasProp {
    eventBus: Observable<handpose.AnnotatedPrediction[]>
    videoBox: {width: number, height: number}
    viewBox: {width: number, height: number}
}

const BSPLINE_DEGREE = 5;

const CanvasComponent = (prop: CanvasProp) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  const [pointer, setPointer] = useState<Vector>();
  const [lines, setLines] = useState<VectorEx[][]>([[]]);
  const [paths, setPaths] = useState<string[]>([]);
  const [trigger, setTrigger] = useState(false);
  const [fingers, setFingers] = useState<any>();
  const [strokeColor, setStrokeColor] = useState<string>("#FFF");

  const ratio = useCallback((arg: Vector) => {
    return {
      x: arg.x * prop.viewBox.width / prop.videoBox.width,
      y: arg.y * prop.viewBox.height / prop.videoBox.height
    }
  },[
    prop.viewBox?.width,
    prop.viewBox?.height,
    prop.videoBox?.width,
    prop.videoBox?.height
  ])

  const createPath = (_vectors: VectorEx[]) => {
    const _v = _vectors.map(v => ({ x: v.x, y: v.y })) as Vector[];
    const bspline = new BSpline(_v, BSPLINE_DEGREE, true);

    const splineVectors = [];
    for (let t = 0; t <= 1; t += 0.01){
      splineVectors.push(bspline.calcAt(t)); 
    }
    console.log(splineVectors)

    let line = splineVectors.reduce((p, vector, i) => {
      const prefix = i == 0 ? "M" : "L";
      const preVector = i == 0 ? null : _vectors[i - 1];

      // const preDistance = distance(preVector, vector);
      // console.log("preDistance", preDistance)

      const v = ratio(vector);
      p += `${prefix} ${v.x},${v.y} `;
      return p;
    }, "");
    return line.length > 0 ? line + "" : null;
  };

  const frame = () => {

  }

  const distance = (point1: Vector, point2: Vector) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const px = dx * dx;
    const py = dy * dy;
    const sqrt = Math.sqrt(px + py);
    return sqrt;
  }

  const dot = (a: Vector, b: Vector) => {
    return a.x * b.x + a.y * b.y;
  }

  const calcTrigger = (thumb: Vector, palmBase: Vector) => {
    const _dot = dot(thumb, palmBase);
    const result = dot(thumb, palmBase) > 0;
    setTrigger(result);
    return result;
  }

  const write = (vector: Vector, ts: number) => {
    const index = lines.length - 1;
    lines[index].push({ ...vector, ts });
    const paths = lines.map(line => createPath(line));
    setPaths(paths);
    setLines(lines);
  }

  useEffect(() => {
    console.log('subscribed')
    const subscription = prop.eventBus.subscribe(predictions => {
      if (canvasRef.current == null && predictions.length === 0) return;
      const annotations = predictions[0].annotations;
      const keys = Object.keys(annotations);
      const fingers = keys.reduce((p, key) => {
        p[key] = annotations[key].map(joint =>
          ({ x: joint[0], y: joint[1] })
        );
        return p;
      }, {} as any);
      setFingers(fingers);
      // console.log("fingers", fingers)

      // const thumbDistance = distance(fingers.thumb[3], fingers.thumb[0]);
      // const indexFingerDistance = distance(fingers.indexFinger[3], fingers.indexFinger[0]);
      // const middleFingerDistance = distance(fingers.middleFinger[3], fingers.middleFinger[0]);
      // const ringFingerDistance = distance(fingers.ringFinger[3], fingers.ringFinger[0]);
      // const pinkyDistance = distance(fingers.pinky[3], fingers.pinky[0]);
      // console.log("fingerDistance", {
      //   thumb: thumbDistance,
      //   index: indexFingerDistance,
      //   middle: middleFingerDistance,
      //   ring: ringFingerDistance,
      //   pinky: pinkyDistance
      // });

      setPointer(fingers.indexFinger[3]);

      const _vec = (s: Vector, e: Vector) => {
        const x = e.x - s.x;
        const y = e.y - s.y;
        return { x, y };
      }

      const _trigger = calcTrigger(
        _vec(fingers.thumb[2], fingers.thumb[3]),
        _vec(fingers.thumb[0], fingers.palmBase[0])
      );
      if (_trigger) {
        write(fingers.indexFinger[3], Date.now());
      } else if (lines.length > 0 && lines[lines.length - 1].length != 0) {
        lines.push([]);
        setLines(lines);
      }

    })
    return () => {
      console.log('unsuscribed')
      subscription.unsubscribe();
    }
  }, []);

  const pathStyles: CSSProperties = useMemo(() => ({
    stroke: strokeColor,
    fill: "none",
    strokeWidth: 2,
  }), [strokeColor]);

  const pointerStyle: CSSProperties = useMemo(() => {
    if (!pointer) return {};
    return {
      left: ratio(pointer).x,
      top: ratio(pointer).y
    }
  }, [pointer?.x, pointer?.y]);

  const born = useMemo(() => {
    if (!fingers) return (<></>);
    // console.log("fingers", fingers)
    return (<>
      {fingers.thumb && fingers.thumb.map((f: Vector, i: number) => 
        (<div key={i} className="pointer" style={{ left: ratio(f).x, top: ratio(f).y }}><div style={{ opacity: 0.8, backgroundColor: "#AAF"}}></div></div>)
      )}
      {fingers.indexFinger && fingers.indexFinger.map((f: Vector, i: number) => 
        (<div key={i} className="pointer" style={{ left: ratio(f).x, top: ratio(f).y }}><div style={{ opacity: 0.8, backgroundColor: "#FAA"}}></div></div>)
      )}
      {fingers.middleFinger && fingers.middleFinger.map((f: Vector, i: number) => 
        (<div key={i} className="pointer" style={{ left: ratio(f).x, top: ratio(f).y }}><div style={{ opacity: 0.8, backgroundColor: "#AFA"}}></div></div>)
      )}
      {fingers.ringFinger && fingers.ringFinger.map((f: Vector, i: number) => 
        (<div key={i} className="pointer" style={{ left: ratio(f).x, top: ratio(f).y }}><div style={{ opacity: 0.8, backgroundColor: "#AFF"}}></div></div>)
      )}
      {fingers.pinky && fingers.pinky.map((f: Vector, i: number) => 
        (<div key={i} className="pointer" style={{ left: ratio(f).x, top: ratio(f).y }}><div style={{ opacity: 0.8, backgroundColor: "#FFA"}}></div></div>)
      )}
      {fingers.palmBase && fingers.palmBase.map((f: Vector, i: number) => 
        (<div key={i} className="pointer" style={{ left: ratio(f).x, top: ratio(f).y }}><div style={{ opacity: 0.8, backgroundColor: "#FAF"}}></div></div>)
      )}
    </>)
  }, [JSON.stringify(fingers)]);

  const prepareVector = (v: Vector) => {
    if (!v) return { x: -100, y: -100 };
    if (!prop.viewBox?.width) return ratio(v);
//     const normalizeX = prop.videoBox.width - (v.x  * prop.videoBox.width / prop.viewBox.width);
// console.log(normalizeX)
//     return {
//       x: normalizeX * prop.viewBox.width / prop.videoBox.width,
//       y: v.y
//     };
    return {
      x: prop.viewBox.width - ratio(v).x,
      y: ratio(v).y
    }
  };

  // const style = useMemo(() => ({...prop.videoBox, border:'solid 1px black', position: 'absolute', visibility: 'hidden' } as CSSProperties), [])
  return (
    <>
      <div className="canvas">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${prop.viewBox.width} ${prop.viewBox.height}`}
          width={prop.viewBox.width}
          height={prop.viewBox.height}
        >
          {paths.length > 0 &&
            paths.map((path, i) => (
              <path key={i} style={pathStyles} d={path} />
            ))
          }
        </svg>
        {/*<canvas ref={canvasRef} style={style as CSSProperties}/>*/}
        <div className="debug-trigger" style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: (trigger ? "#F00" : "#000")
        }}></div>
        {pointer && !trigger && <div className="pointer" style={pointerStyle}><div></div></div>}
        {/*born*/}
      </div>
      <div className="button-container">
        <ButtonComponent
          order={0}
          label={"黒"}
          point={prepareVector(pointer)}
          click={trigger}
          callback={() => setStrokeColor("#000")}
        ></ButtonComponent>
        <ButtonComponent
          order={0}
          label={"白"}
          point={prepareVector(pointer)}
          click={trigger}
          callback={() => setStrokeColor("#FFF")}
        ></ButtonComponent>
      </div>
    </>
  )
}

export default CanvasComponent;
