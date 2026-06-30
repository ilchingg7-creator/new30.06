import '@testing-library/jest-dom/vitest';

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return {
      canvas: this,
      fillRect: () => undefined,
      clearRect: () => undefined,
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      putImageData: () => undefined,
      createImageData: () => ({ data: new Uint8ClampedArray(4) }),
      setTransform: () => undefined,
      drawImage: () => undefined,
      save: () => undefined,
      restore: () => undefined,
      beginPath: () => undefined,
      moveTo: () => undefined,
      lineTo: () => undefined,
      closePath: () => undefined,
      stroke: () => undefined,
      fill: () => undefined,
      translate: () => undefined,
      scale: () => undefined,
      rotate: () => undefined,
      arc: () => undefined,
      rect: () => undefined,
      measureText: () => ({ width: 0 }),
      fillText: () => undefined,
      strokeText: () => undefined
    } as unknown as CanvasRenderingContext2D;
  };
}
