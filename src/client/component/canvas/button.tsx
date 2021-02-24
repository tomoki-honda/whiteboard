import * as React from 'react';
import { Vector } from '../../interface/vector';

import './button.scss';
import { useEffect, useRef, useState } from 'react';


interface ButtonProp {
  order: number;
  label: string;
  point: Vector;
  click: boolean;
  callback: Function;
}
const ButtonComponent = (prop: ButtonProp) => {
  const ref = useRef<HTMLDivElement>();
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const ele = ref.current;
    const rect = ele.getBoundingClientRect();
    setFocus(
      rect.bottom > prop.point.y &&
      rect.top < prop.point.y &&
      rect.left < prop.point.x &&
      rect.right > prop.point.x
    );
  }, [prop.point?.x, prop.point?.y]);

  useEffect(() => {
    if (prop.callback && prop.click && focus) {
      prop.callback();
    }
  }, [prop.callback, prop.click, focus]);

  return (
    <div ref={ref} className={`button ${focus ? "focus" : ""} ${prop.click ? "active" : ""}`}>
      {prop.label}
    </div>
  )
}

export default ButtonComponent;
