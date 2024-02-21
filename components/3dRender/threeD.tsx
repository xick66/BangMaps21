import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Box, Html } from '@react-three/drei';

// Room definition with color and label
interface Room {
  width: number;
  depth: number;
  height: number; // Added for 3D height
  position: { x: number; y: number; z: number };
  color: string; // Specific color for each room
  label: string; // Label for each room
}

// Floor definition with a vertical offset
interface Floor {
  rooms: Room[];
  heightOffset: number;
}

// BuildingFeatures now include a positional offset
interface BuildingFeatures {
  floors: Floor[];
  positionOffset: { x: number; y: number; z: number };
}

interface ThreeDSceneProps {
  buildings: BuildingFeatures[];
}

const ThreeDScene: React.FC<ThreeDSceneProps> = ({ buildings }) => {
  return (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
      <OrthographicCamera makeDefault position={[0, 50, 0]} zoom={20} />
      <ambientLight intensity={0.5} />
      <OrbitControls enableRotate={false} enablePan={true} panSpeed={0.5} />

      {buildings.map((building, buildingIndex) => (
        <group
          position={[
            building.positionOffset.x,
            building.positionOffset.y,
            building.positionOffset.z,
          ]}
          key={`building-${buildingIndex}`}
        >
          {building.floors.map((floor, floorIndex) => (
            <group
              position={[0, -floor.heightOffset, 0]}
              key={`floor-${floorIndex}`}
            >
              {floor.rooms.map((room, roomIndex) => (
                <Box
                  key={`room-${roomIndex}`}
                  args={[room.width, room.height, room.depth]}
                  position={[room.position.x, room.position.y, room.position.z]}
                >
                  <meshBasicMaterial attach="material" color={room.color} transparent={true} opacity={0.8} />
                  <Html position={[0, room.height / 2, 0]}>
                    <div style={{ transform: 'scale(1.0)', color: 'white', textAlign: 'center' }}>
                      {room.label}
                    </div>
                  </Html>
                </Box>
              ))}
            </group>
          ))}
        </group>
      ))}
    </Canvas>
  );
};

export default ThreeDScene;
