import { Observable } from 'rxjs';
import * as handpose from '@tensorflow-models/handpose';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';

interface CanvasProp {
    eventBus: Observable<handpose.AnnotatedPrediction[]>
    videoBox: {width: number, height: number}
}
const CanvasComponent = (prop: CanvasProp) => {
    const canvasRef = useRef<HTMLCanvasElement>();

    useEffect(() => {
        console.log('subscribed')
        const subscription = prop.eventBus.subscribe(predictions => {
            if (canvasRef.current == null && predictions.length === 0) return;

            const context = canvasRef.current.getContext('2d');
            const canvasBox = {width: canvasRef.current.width, height: canvasRef.current.height}

            const annotations = predictions[0].annotations;
            const keys = Object.keys(annotations);
            const f = keys.reduce((p, key) => {
                p[key] = annotations[key].map(joint =>
                    ({ x: joint[0], y: joint[1] })
                );
                return p;
            }, {} as any)

            const finger = f.indexFinger[3];

            const point = {
                x: canvasBox.width - canvasBox.width * finger.x / prop.videoBox.width,
                y: canvasBox.height * finger.y / prop.videoBox.height
            }

            console.log('point', point, canvasBox, finger, predictions[0])

            context.fillStyle = 'rgb(255, 0, 0)';
            context.fillRect(point.x, point.y, 1, 1)
        })
        return () => {
            console.log('unsuscribed')
            subscription.unsubscribe()
        }
    }, []);

    const style = useMemo(() => ({...prop.videoBox, border:'solid 1px black', position: 'absolute' }), [])
    return (
        <canvas ref={canvasRef} style={style as CSSProperties}/>
    )
}

export default CanvasComponent;
