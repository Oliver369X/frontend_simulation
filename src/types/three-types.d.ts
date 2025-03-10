import { Object3D, Material, Group, Mesh } from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: ReactThreeFiber.Object3DNode<Group, typeof Group>;
      mesh: ReactThreeFiber.Object3DNode<Mesh, typeof Mesh>;
      ambientLight: ReactThreeFiber.LightNode;
      pointLight: ReactThreeFiber.LightNode;
      meshStandardMaterial: ReactThreeFiber.MaterialNode<Material>;
    }
  }
}

declare module '@react-three/fiber' {
  export interface ThreeElements {
    group: Object3D;
    mesh: Object3D;
    ambientLight: Object3D;
    pointLight: Object3D;
    meshStandardMaterial: Material;
  }
} 