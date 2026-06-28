declare module 'react-globe.gl' {
  import { Component } from 'react';

  interface GlobeControls {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    enablePan: boolean;
    rotateSpeed: number;
  }

  interface GlobeInstance {
    controls(): GlobeControls;
    scene(): THREE.Scene;
    renderer(): THREE.WebGLRenderer;
    camera(): THREE.PerspectiveCamera;
  }

  export default class Globe extends Component<Record<string, unknown>> {
    controls(): GlobeControls;
    scene(): THREE.Scene;
    renderer(): THREE.WebGLRenderer;
    camera(): THREE.PerspectiveCamera;
  }
}

declare module 'three-globe' {
  export default class ThreeGlobe {
    scene(): import('three').Scene;
    renderer(): import('three').WebGLRenderer;
  }
}
