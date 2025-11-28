"use client"

import React, { useEffect, useRef } from 'react';
import { 
  Engine, 
  Scene, 
  FreeCamera, 
  HemisphericLight, 
  Vector3, 
  MeshBuilder, 
  Color3, 
  StandardMaterial, 
  Mesh,
  PointerDragBehavior,
  PointerEventTypes,
  AbstractMesh
} from '@babylonjs/core';

interface RobotArmSceneProps {
  baseRotation: number;
  shoulderRotation: number;
  elbowRotation: number;
  gripperPosition: number;
  onBaseRotationChange: (value: number) => void;
  onShoulderRotationChange: (value: number) => void;
  onElbowRotationChange: (value: number) => void;
}

const RobotArmScene: React.FC<RobotArmSceneProps> = ({ 
  baseRotation, 
  shoulderRotation, 
  elbowRotation, 
  gripperPosition,
  onBaseRotationChange,
  onShoulderRotationChange,
  onElbowRotationChange
}) => {
  const reactCanvas = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<Mesh | null>(null);
  const shoulderJointRef = useRef<Mesh | null>(null);
  const elbowJointRef = useRef<Mesh | null>(null);
  const gripperFinger1Ref = useRef<Mesh | null>(null);
  const gripperFinger2Ref = useRef<Mesh | null>(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    const jointMaterial = new StandardMaterial("jointMat", scene);
    jointMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2);

    const armMaterial = new StandardMaterial("armMat", scene);
    armMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7);

    const base = MeshBuilder.CreateCylinder("base", { height: 0.5, diameter: 2 }, scene);
    base.position.y = 0.25;
    baseRef.current = base;

    const shoulderJoint = MeshBuilder.CreateSphere("shoulder", { diameter: 0.8 }, scene);
    shoulderJoint.parent = base;
    shoulderJoint.position.y = 0.5;
    shoulderJointRef.current = shoulderJoint;

    const upperArm = MeshBuilder.CreateCylinder("upperArm", { height: 2.5, diameter: 0.5 }, scene);
    upperArm.parent = shoulderJoint;
    upperArm.position.y = 1.25;

    const elbowJoint = MeshBuilder.CreateSphere("elbow", { diameter: 0.7 }, scene);
    elbowJoint.parent = upperArm;
    elbowJoint.position.y = 1.25;
    elbowJointRef.current = elbowJoint;

    const forearm = MeshBuilder.CreateCylinder("forearm", { height: 2, diameter: 0.4 }, scene);
    forearm.parent = elbowJoint;
    forearm.position.y = 1;

    const wristJoint = MeshBuilder.CreateSphere("wrist", { diameter: 0.5 }, scene);
    wristJoint.parent = forearm;
    wristJoint.position.y = 1;
    wristJoint.rotation.y = Math.PI / 2;

    const gripperFinger1 = MeshBuilder.CreateBox("finger1", { width: 0.1, height: 0.6, depth: 0.1 }, scene);
    gripperFinger1.parent = wristJoint;
    gripperFinger1.position.y = 0.3;
    gripperFinger1Ref.current = gripperFinger1;

    const gripperFinger2 = MeshBuilder.CreateBox("finger2", { width: 0.1, height: 0.6, depth: 0.1 }, scene);
    gripperFinger2.parent = wristJoint;
    gripperFinger2.position.y = 0.3;
    gripperFinger2Ref.current = gripperFinger2;

    shoulderJoint.material = jointMaterial;
    elbowJoint.material = jointMaterial;
    wristJoint.material = jointMaterial;
    base.material = armMaterial;
    upperArm.material = armMaterial;
    forearm.material = armMaterial;
    gripperFinger1.material = armMaterial;
    gripperFinger2.material = armMaterial;

    // --- Interactivity ---

    // Shoulder and Base Rotation
    const shoulderDragBehavior = new PointerDragBehavior();
    let startBaseRotation = 0;
    let startShoulderRotation = 0;
    let startPointerX = 0;
    let startPointerY = 0;
    shoulderDragBehavior.onDragStartObservable.add((event) => {
      if (!event.pointerInfo) return;
      startBaseRotation = baseRotation;
      startShoulderRotation = shoulderRotation;
      startPointerX = event.pointerInfo.event.clientX;
      startPointerY = event.pointerInfo.event.clientY;
    });
    shoulderDragBehavior.onDragObservable.add((event) => {
      if (!event.pointerInfo) return;
      const deltaX = event.pointerInfo.event.clientX - startPointerX;
      const deltaY = event.pointerInfo.event.clientY - startPointerY;
      const sensitivity = 0.5;

      // Base rotation from horizontal drag
      let newBaseRotation = startBaseRotation + deltaX * sensitivity;
      newBaseRotation = Math.max(-180, Math.min(180, newBaseRotation));
      onBaseRotationChange(newBaseRotation);

      // Shoulder rotation from vertical drag
      let newShoulderRotation = startShoulderRotation - deltaY * sensitivity;
      newShoulderRotation = Math.max(-90, Math.min(90, newShoulderRotation));
      onShoulderRotationChange(newShoulderRotation);
    });
    shoulderJoint.addBehavior(shoulderDragBehavior);

    // Elbow Rotation
    const elbowDragBehavior = new PointerDragBehavior();
    let startElbowRotation = 0;
    let startElbowPointerY = 0;
    elbowDragBehavior.onDragStartObservable.add((event) => {
      if (!event.pointerInfo) return;
      startElbowRotation = elbowRotation;
      startElbowPointerY = event.pointerInfo.event.clientY;
    });
    elbowDragBehavior.onDragObservable.add((event) => {
      if (!event.pointerInfo) return;
      const deltaY = event.pointerInfo.event.clientY - startElbowPointerY;
      const sensitivity = 0.5;
      let newRotation = startElbowRotation - deltaY * sensitivity;
      newRotation = Math.max(0, Math.min(145, newRotation));
      onElbowRotationChange(newRotation);
    });
    elbowJoint.addBehavior(elbowDragBehavior);

    // Cursor feedback
    const interactiveMeshes: AbstractMesh[] = [shoulderJoint, elbowJoint];
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => interactiveMeshes.includes(mesh));
        canvas.style.cursor = (pickResult && pickResult.hit) ? "grab" : "default";
      }
    });
    
    [shoulderDragBehavior, elbowDragBehavior].forEach(behavior => {
        behavior.onDragStartObservable.add(() => canvas.style.cursor = "grabbing");
        behavior.onDragEndObservable.add(() => canvas.style.cursor = "grab");
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [onBaseRotationChange, onShoulderRotationChange, onElbowRotationChange, baseRotation, shoulderRotation, elbowRotation]);

  useEffect(() => {
    if (baseRef.current) {
      baseRef.current.rotation.y = baseRotation * (Math.PI / 180);
    }
    if (shoulderJointRef.current) {
      shoulderJointRef.current.rotation.z = shoulderRotation * (Math.PI / 180);
    }
    if (elbowJointRef.current) {
      elbowJointRef.current.rotation.z = elbowRotation * (Math.PI / 180);
    }
    if (gripperFinger1Ref.current && gripperFinger2Ref.current) {
      const minGap = 0.1;
      const maxGap = 0.3;
      const gap = minGap + (gripperPosition / 100) * (maxGap - minGap);
      gripperFinger1Ref.current.position.x = -gap;
      gripperFinger2Ref.current.position.x = gap;
    }
  }, [baseRotation, shoulderRotation, elbowRotation, gripperPosition]);

  return <canvas ref={reactCanvas} className="w-full h-full outline-none" />;
};

export default RobotArmScene;