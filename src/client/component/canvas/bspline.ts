import { Vector } from '../../interface/vector';

export class BSpline {
  points: Vector[];
  degree: number;
  dimension: number;
  baseFunc: (x: number) => number;
  baseFuncRangeInt: number;

  constructor(points: Vector[], degree: number, copy: boolean) {
    this.points = copy ? points.slice() : points;
    this.degree = degree;
    this.dimension = 2; // dimension
    if (degree == 2) {
      this.baseFunc = this.basisDeg2;
      this.baseFuncRangeInt = 2;
    } else if(degree == 3) {
      this.baseFunc = this.basisDeg3;
      this.baseFuncRangeInt = 2;
    } else if(degree == 4) {
      this.baseFunc = this.basisDeg4;
      this.baseFuncRangeInt = 3;
    } else if(degree == 5) {
      this.baseFunc = this.basisDeg5;
      this.baseFuncRangeInt = 3;
    } 
  }

  dimKey: { [index: number]: "x" | "y" | "z" } = {
    0: "x",
    1: "y",
    2: "z"
  };

  seqAt(dim: number): ((n: number) => number) {
    const points = this.points;
    const margin = this.degree + 1;
    return (n: number) => {
      if (n < margin) {
        return points[0][this.dimKey[dim]];
      } else if (points.length + margin <= n) {
        return points[points.length-1][this.dimKey[dim]];
      }
      return points[n-margin][this.dimKey[dim]];
    };
  }

  basisDeg2(x: number) {
    if (-0.5 <= x && x < 0.5) {
      return 0.75 - x * x;
    } else if (0.5 <= x && x <= 1.5) {
      return 1.125 + (-1.5 + x / 2.0) * x;
    } else if (-1.5 <= x && x < -0.5) {
      return 1.125 + (1.5 + x / 2.0) * x;
    }
    return 0;
  }

  basisDeg3(x: number) {
    if (-1 <= x && x < 0) {
      return 2.0/3.0 + (-1.0 - x / 2.0) * x * x;
    } else if (1 <= x && x <= 2) {
      return 4.0/3.0 + x * (-2.0 + (1.0 - x / 6.0) * x);
    } else if (-2 <= x && x < -1) {
      return 4.0 / 3.0 + x * (2.0 + (1.0 + x / 6.0) * x);
    } else if (0 <= x && x < 1) {
      return 2.0 / 3.0 + (-1.0 + x / 2.0) * x * x;
    }
    return 0;
  }

  basisDeg4(x: number) {
    if (-1.5 <= x && x < -0.5) {
      return 55.0 / 96.0 + x * (-(5.0 / 24.0) + x * (-(5.0 / 4.0) + (-(5.0 / 6.0) - x / 6.0) * x));
    } else if (0.5 <= x && x < 1.5) {
      return 55.0 / 96.0 + x * (5.0 / 24.0 + x * (-(5.0 / 4.0) + (5.0 / 6.0 - x / 6.0) * x));
    } else if (1.5 <= x && x <= 2.5) {
      return 625.0 / 384.0 + x * (-(125.0 / 48.0) + x * (25.0 / 16.0 + (-(5.0 / 12.0) + x / 24.0) * x));
    } else if (-2.5 <= x && x <= -1.5) {
      return 625.0 / 384.0 + x * (125.0 / 48.0 + x * (25.0 / 16.0 + (5.0 / 12.0 + x / 24.0) * x));
    } else if (-1.5 <= x && x < 1.5) {
      return 115.0 / 192.0 + x * x * (-(5.0 / 8.0) + x * x / 4.0);
    }
    return 0;
  }

  basisDeg5(x: number) {
    if (-2 <= x && x < -1) {
      return 17.0 / 40.0 + x * (-(5.0 / 8.0) + x * (-(7.0 / 4.0) + x * (-(5.0 / 4.0) + (-(3.0 / 8.0) - x / 24.0) * x)));
    } else if (0 <= x && x < 1) {
      return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 - x / 12.0) * x * x);
    } else if (2 <= x && x <= 3) {
      return 81.0 / 40.0 + x * (-(27.0 / 8.0) + x * (9.0 / 4.0 + x * (-(3.0 / 4.0) + (1.0 / 8.0 - x / 120.0) * x)));
    } else if (-3 <= x && x < -2) {
      return 81.0 / 40.0 + x * (27.0 / 8.0 + x * (9.0 / 4.0 + x * (3.0 / 4.0 + (1.0 / 8.0 + x / 120.0) * x)));
    } else if (1 <= x && x < 2) {
      return 17.0 / 40.0 + x * (5.0 / 8.0 + x * (-(7.0 / 4.0) + x * (5.0 / 4.0 + (-(3.0 / 8.0) + x / 24.0) * x)));
    } else if (-1 <= x && x < 0) {
      return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 + x / 12.0) * x * x);
    }
    return 0;
  }

  getInterpol(seq: (dim: number) => number, t: number) {
    const rangeInt = this.baseFuncRangeInt;
    const tInt = Math.floor(t);
    let result = 0;
    for (let i = tInt - rangeInt; i <= tInt + rangeInt; i++) {
      result += seq(i) * this.baseFunc(t-i);
    }
    return result;
  }

  calcAt(t: number): Vector {
    const _t = t * ((this.degree + 1) * 2 + this.points.length); //t must be in [0,1]
    const res: number[] = [];
    for (let i = 0; i < this.dimension; i++) {
      res.push(this.getInterpol(this.seqAt(i), _t));
    }
    return { x: res[0], y: res[1] };
  }
}
