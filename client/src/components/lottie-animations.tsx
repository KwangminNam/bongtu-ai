"use client";

import Lottie from "lottie-react";

// 빈 상태 애니메이션 (인라인 JSON)
const emptyAnimation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: "empty",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "box",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [-5] },
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 60, s: [5] },
            { t: 120, s: [-5] }
          ]
        },
        p: { a: 0, k: [100, 110, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [60, 50] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 8 },
          nm: "Rectangle"
        },
        {
          ty: "st",
          c: { a: 0, k: [0.7, 0.7, 0.7, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 3 },
          lc: 2,
          lj: 2,
          nm: "Stroke"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.95, 0.95, 0.95, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 120,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "line1",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [30] },
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 60, s: [60] },
            { t: 120, s: [30] }
          ]
        },
        p: {
          a: 1,
          k: [
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 0, s: [100, 75, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 60, s: [100, 70, 0] },
            { t: 120, s: [100, 75, 0] }
          ]
        },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "rc",
          s: { a: 0, k: [30, 6] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 3 }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.8, 0.8, 0.8, 1] },
          o: { a: 0, k: 100 }
        }
      ],
      ip: 0,
      op: 120
    }
  ]
};

// 성공 애니메이션
const successAnimation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [50, 50, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.8], y: [0] }, t: 0, s: [0, 0, 100] },
            { i: { x: [0.2], y: [1] }, o: { x: [0.8], y: [0] }, t: 20, s: [110, 110, 100] },
            { t: 35, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [60, 60] },
          p: { a: 0, k: [0, 0] }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.2, 0.8, 0.4, 1] },
          o: { a: 0, k: 100 }
        }
      ],
      ip: 0,
      op: 60
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "checkmark",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 15, s: [0] },
            { t: 25, s: [100] }
          ]
        },
        p: { a: 0, k: [50, 50, 0] }
      },
      ao: 0,
      shapes: [
        {
          ty: "sh",
          d: 1,
          ks: {
            a: 0,
            k: {
              i: [[0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0]],
              v: [[-12, 0], [-4, 8], [12, -8]],
              c: false
            }
          }
        },
        {
          ty: "st",
          c: { a: 0, k: [1, 1, 1, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 },
          lc: 2,
          lj: 2
        },
        {
          ty: "tm",
          s: { a: 0, k: 0 },
          e: {
            a: 1,
            k: [
              { i: { x: [0.2], y: [1] }, o: { x: [0.8], y: [0] }, t: 20, s: [0] },
              { t: 40, s: [100] }
            ]
          },
          o: { a: 0, k: 0 }
        }
      ],
      ip: 0,
      op: 60
    }
  ]
};

// 로딩 애니메이션
const loadingAnimation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "loading",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "dot1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: {
          a: 1,
          k: [
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 0, s: [30, 50, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 15, s: [30, 40, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 30, s: [30, 50, 0] },
            { t: 60, s: [30, 50, 0] }
          ]
        }
      },
      ao: 0,
      shapes: [
        { ty: "el", s: { a: 0, k: [12, 12] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.4, 0.4, 0.9, 1] }, o: { a: 0, k: 100 } }
      ],
      ip: 0,
      op: 60
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "dot2",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: {
          a: 1,
          k: [
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 10, s: [50, 50, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 25, s: [50, 40, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 40, s: [50, 50, 0] },
            { t: 60, s: [50, 50, 0] }
          ]
        }
      },
      ao: 0,
      shapes: [
        { ty: "el", s: { a: 0, k: [12, 12] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.4, 0.4, 0.9, 1] }, o: { a: 0, k: 100 } }
      ],
      ip: 0,
      op: 60
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "dot3",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: {
          a: 1,
          k: [
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 20, s: [70, 50, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 35, s: [70, 40, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 50, s: [70, 50, 0] },
            { t: 60, s: [70, 50, 0] }
          ]
        }
      },
      ao: 0,
      shapes: [
        { ty: "el", s: { a: 0, k: [12, 12] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", c: { a: 0, k: [0.4, 0.4, 0.9, 1] }, o: { a: 0, k: 100 } }
      ],
      ip: 0,
      op: 60
    }
  ]
};

export function EmptyState({ message = "데이터가 없습니다" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Lottie
        animationData={emptyAnimation}
        loop
        style={{ width: 120, height: 120 }}
      />
      <p className="text-sm text-muted-foreground mt-2">{message}</p>
    </div>
  );
}

export function SuccessAnimation({ size = 80 }: { size?: number }) {
  return (
    <Lottie
      animationData={successAnimation}
      loop={false}
      style={{ width: size, height: size }}
    />
  );
}

export function LoadingDots({ size = 60 }: { size?: number }) {
  return (
    <Lottie
      animationData={loadingAnimation}
      loop
      style={{ width: size, height: size }}
    />
  );
}
