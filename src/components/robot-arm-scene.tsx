"use client"

import React, { useEffect, useRef } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, Color3, StandardMaterial, Mesh } from '@babylonjs/core';

interface RobotArmSceneProps {
  baseRotation: number;
  shoulderRotation: number;
  elbowRotation: number;
}

const RobotArmScene: React.FC<RobotArmSceneProps> = ({ baseRotation, shoulderRotation, elbowRotation }) => {
  const reactCanvas = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<Mesh | null>(null);
  const upperArmRef = useRef<Mesh | null>(null);
  const forearmRef = useRef<Mesh | null>(null);

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

    // Ground
    MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    // Materials
    const jointMaterial = new StandardMaterial("jointMat", scene);
    jointMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2); // Red

    const armMaterial = new StandardMaterial("armMat", scene);
    armMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7); // Gray

    // Robot Arm Parts
    // Base
    const base = MeshBuilder.CreateCylinder("base", { height: 0.5, diameter: 2 }, scene);
    base.position.y = 0.25;
    baseRef.current = base;

    // Shoulder Joint
    const shoulderJoint = MeshBuilder.CreateSphere("shoulder", { diameter: 0.8 }, scene);
    shoulderJoint.parent = base;
    shoulderJoint.position.y = 0.5;

    // Upper Arm
    const upperArm = MeshBuilder.CreateCylinder("upperArm", { height: 2.5, diameter: 0.5 }, scene);
    upperArm.parent = shoulderJoint;
    upperArm.position.y = 1.25;
    upperArmRef.current = upperArm;

    // Elbow Joint
    const elbowJoint = MeshBuilder.CreateSphere("elbow", { diameter: 0.7 }, scene);
    elbowJoint.parent = upperArm;
    elbowJoint.position.y = 1.25;

    // Forearm
    const forearm = MeshBuilder.CreateCylinder("forearm", { height: 2, diameter: 0.4 }, scene);
    forearm.parent = elbowJoint;
    forearm.position.y = 1;
    forearmRef.current = forearm;

    // Apply materials
    shoulderJoint.material = jointMaterial;
    elbowJoint.material = jointMaterial;
    base.material = armMaterial;
    upperArm.material = armMaterial;
    forearm.material = armMaterial;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (baseRef.current) {
      baseRef.current.rotation.y = baseRotation * (Math.PI / 180);
    }
    if (upperArmRef.current) {
      // Rotating around Z-axis for up/down motion
      upperArmRef.current.rotation.z = shoulderRotation * (Math.PI / 180);
    }
    if (forearmRef.current) {
      // Rotating around Z-axis for elbow bend
      forearmRef.current.rotation.z = elbowRotation * (Math.PI / 180);
    }
  }, [baseRotation, shoulderRotation, elbowRotation]);

  return <canvas ref={reactCanvas} className="w-full h-full outline-none" />;
};

export default RobotArmScene;