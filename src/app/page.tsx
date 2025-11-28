"use client"

import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import RobotArmScene from '@/components/robot-arm-scene';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [baseRotation, setBaseRotation] = useState(0);
  const [shoulderRotation, setShoulderRotation] = useState(-45);
  const [elbowRotation, setElbowRotation] = useState(45);
  const [gripperPosition, setGripperPosition] = useState(50); // 0: closed, 100: open

  return (
    <div className="relative flex flex-col h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>
      <main className="flex-grow grid md:grid-cols-3 grid-cols-1 h-full">
        <div className="md:col-span-2 h-full w-full">
          <RobotArmScene 
            baseRotation={baseRotation}
            shoulderRotation={shoulderRotation}
            elbowRotation={elbowRotation}
            gripperPosition={gripperPosition}
          />
        </div>
        <div className="md:col-span-1 bg-background border-l p-4 md:p-6 flex flex-col justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Robot Arm Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="base-rotation">Base Rotation</Label>
                  <span className="text-sm text-muted-foreground">{baseRotation.toFixed(0)}°</span>
                </div>
                <Slider
                  id="base-rotation"
                  min={-180}
                  max={180}
                  step={1}
                  value={[baseRotation]}
                  onValueChange={(value) => setBaseRotation(value[0])}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="shoulder-rotation">Shoulder Angle</Label>
                  <span className="text-sm text-muted-foreground">{shoulderRotation.toFixed(0)}°</span>
                </div>
                <Slider
                  id="shoulder-rotation"
                  min={-90}
                  max={90}
                  step={1}
                  value={[shoulderRotation]}
                  onValueChange={(value) => setShoulderRotation(value[0])}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="elbow-rotation">Elbow Angle</Label>
                  <span className="text-sm text-muted-foreground">{elbowRotation.toFixed(0)}°</span>
                </div>
                <Slider
                  id="elbow-rotation"
                  min={0}
                  max={145}
                  step={1}
                  value={[elbowRotation]}
                  onValueChange={(value) => setElbowRotation(value[0])}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="gripper-position">Gripper</Label>
                  <span className="text-sm text-muted-foreground">{gripperPosition}%</span>
                </div>
                <Slider
                  id="gripper-position"
                  min={0}
                  max={100}
                  step={1}
                  value={[gripperPosition]}
                  onValueChange={(value) => setGripperPosition(value[0])}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <MadeWithDyad />
      </div>
    </div>
  );
}