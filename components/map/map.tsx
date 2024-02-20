'use client';

import 'leaflet/dist/leaflet.css';

import L, { Icon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer,useMap,Circle ,CircleMarker,Polyline } from 'react-leaflet';
import omnivore from "@mapbox/leaflet-omnivore";
import markerBlue from '../../public/pin-blue.svg';
import markerRed from '../../public/pin-red.svg';
import React,{useState,useRef,useEffect} from 'react';
import { Circle as LeafletCircle } from 'react-leaflet';
import { PathOptions } from 'leaflet';
const circleRadius = 1000;
interface ExtendedCircleProps {
  center: [number, number];
  pathOptions?: PathOptions;
  radius: number;
}
interface DataPoint {
    lat: number;
    lng: number;
    [key: string]: any; // For additional properties from `properties`
  }

const ExtendedCircle: React.FC<ExtendedCircleProps> = (props) => {
  return <LeafletCircle {...props} />;
};

// const ExtendedCircle: React.FC<ExtendedCircleProps> = ({ center, pathOptions, radius }) => {
//     const [currentRadius, setCurrentRadius] = useState<number>(0);
//     const maxRadius = radius; // The maximum radius your circle should achieve while scanning
  
//     useEffect(() => {
//       const interval = setInterval(() => {
//         setCurrentRadius((prevRadius) => {
//           if (prevRadius >= maxRadius) {
//             return 0; // Reset the radius to create a continuous scanning effect
//           }
//           return prevRadius + 10; // Increment the radius. Adjust the value for speed.
//         });
//       }, 100); // Adjust the interval for speed. Smaller values make the animation faster.
  
//       return () => clearInterval(interval);
//     }, [maxRadius]);
  
//     return (
//       <LeafletCircle
//         center={center}
//         pathOptions={pathOptions}
//         {...{radius:currentRadius }}
//       />
//     );
//   };


// const ExtendedCircle: React.FC<ExtendedCircleProps> = ({ center, radius, pathOptions }) => {
//     const map = useMap();
//     const scanningLineRef = useRef<L.Polyline | null>(null);
  
//     useEffect(() => {
//       if (!map || !scanningLineRef.current) return;
  
//       let angle = 0;
//       const updateLine = () => {
//         if (!scanningLineRef.current) return;
  
//         const endPoint = calculateEndPoint(center, radius, angle);
//         scanningLineRef.current.setLatLngs([center, endPoint]);
//         angle = (angle + 10) % 360; // Increment angle for rotation, reset every 360 degrees
//       };
  
//       const intervalId = setInterval(updateLine, 100); // Update line position every 100 ms
  
//       return () => clearInterval(intervalId);
//     }, [map, center, radius]);
  
//     return (
//       <>
//         <ExtendedCircle center={center} {...{radius:radius} } pathOptions={pathOptions} />
//         <L.Polyline ref={scanningLineRef} positions={[center, center]} color="green" />
//       </>
//     );
//   };
  
//   function calculateEndPoint(center, radius, angle) {
//     const angleRad = (angle * Math.PI) / 180;
//     const dx = radius * Math.cos(angleRad);
//     const dy = radius * Math.sin(angleRad);
//     const latLng = L.latLng(center[0], center[1]);
//     const map = L.map("map"); // Replace "map" with the ID of your map container
//     const endPoint = map.unproject(map.project(latLng).add([dx, -dy]));
//     return [endPoint.lat, endPoint.lng];
//   }
  
// const ExtendedCircle: React.FC<ExtendedCircleProps> = ({ center, radius, pathOptions }) => {
//     const map = useMap();
//     const scanningLineRef = useRef<L.Polyline | null>(null);
  
//     useEffect(() => {
//       if (!map || !scanningLineRef.current) return;
  
//       let angle = 0;
//       const updateLine = () => {
//         if (!scanningLineRef.current) return;
  
//         const endPoint = calculateEndPoint(map, center, radius, angle); // Pass the map instance here
//         scanningLineRef.current.setLatLngs([center, endPoint]);
//         angle = (angle + 10) % 360; // Increment angle for rotation, reset every 360 degrees
//       };
  
//       const intervalId = setInterval(updateLine, 100); // Update line position every 100 ms
  
//       return () => clearInterval(intervalId);
//     }, [map, center, radius]);
  
//     return (
//       <>
//         <ExtendedCircle center={center} radius={radius} pathOptions={pathOptions} />
//         <L.Polyline ref={scanningLineRef} positions={[center, center]} color="green" />
//       </>
//     );
// };

// function calculateEndPoint(map, center, radius, angle) {
//     const angleRad = (angle * Math.PI) / 180;
//     const dx = radius * Math.cos(angleRad);
//     const dy = radius * Math.sin(angleRad);
//     const latLng = L.latLng(center[0], center[1]);
//     const endPoint = map.unproject(map.project(latLng).add([dx, -dy]));
//     return [endPoint.lat, endPoint.lng];
// }

const markersByColor = {
    'red': new Icon({iconUrl: markerRed.src, iconSize: [24, 32]}),
    'blue': new Icon({iconUrl: markerBlue.src, iconSize: [24, 32]})
}


export interface MapProps {
    zoomLevel?: number;
    center: [number, number];
    markers: {
        label: string;
        position: [number, number];
        color: string;
    }[];
    kmlFiles:string[];
    iconMapping: { [key: string]: string }; 
}


const KMLLayer = ({ kmlFile, iconUrl, circleCenter, circleRadius }) => {
    const map = useMap();
    const [extractedData, setExtractedData] = useState<DataPoint[]>([]);
         useEffect(() => {
        const kmlLayer = omnivore.kml(kmlFile)
            .on('ready', () => {
                const newData: DataPoint[] = [];
                  kmlLayer.eachLayer((layer) => {
                    const featureType = layer.feature.geometry.type;
                    if (featureType === 'Point' && iconUrl) {
                        // const { lat, lng } = layer.getLatLng();
                        // const distance = calculateDistance(lat, lng, circleCenter[0], circleCenter[1]);
                        // console.log(circleCenter[0],circleCenter[1]);
                        const icon = new Icon({ iconUrl, iconSize: [24, 32] });
                        layer.setIcon(icon);
                        // if (distance <= 1) {
                        //     newData.push({ lat, lng, ...properties });                        }
                    }
                });
                // setExtractedData((prevData) => [...prevData, ...newData]);
                map.fitBounds(kmlLayer.getBounds());
            })
            .addTo(map);

        return () => {
            map.removeLayer(kmlLayer);
        };
    }, [kmlFile, map, iconUrl, circleCenter, circleRadius]); 

    return null;
};

interface Marker {
    position: [number, number];
    label: string;
    color: string;
  }
  
export default function Map({center, markers,kmlFiles=[],iconMapping,zoomLevel = 17 }: MapProps) {
const mapRef=useRef()
const [circleData, setCircleData] = useState([]); 
    const [kmlData, setKmlData] = useState([]);
    const [userMarkers, setUserMarkers] = useState<Marker[]>([]);

const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newMarker: Marker = {
      position: [e.latlng.lat, e.latlng.lng],
      label: 'Custom Marker',
      color: 'blue',
    };

    setUserMarkers([...userMarkers, newMarker]); // Add the new marker to the state
  };

const fetchKmlData = async () => {
    const response = await fetch('/riskanalysis/route', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            circles: markers.map(marker => ({ 
                radius: circleRadius,
            })),
        }),
    });

    if (response.ok) {
        const data = await response.json();
        setKmlData(data.pointsInCircles); // Update state with the received KML data
    } else {
        // Handle errors
        console.error('Failed to fetch KML data');
    }
};
useEffect(() => {
    fetchKmlData();
}, [markers]);
    return <div>
        <MapContainer center={center} zoom={zoomLevel} style={{ height: '100vh' }}
        ref={mapRef}
        {...{} as any}
        >
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            {...{} as any}
            />
                             {markers.map((data, index) => {
                    return (
                        <div key={index}>
                            <Marker
                                position={data.position}
                                icon={markersByColor[data?.color] ?? markersByColor['red']}
                                {...{} as any}
                            >
                                <Popup>{data.label}</Popup>
                            </Marker>
                            <ExtendedCircle
  center={data.position}
  pathOptions={{ color: 'red' }}
  radius={circleRadius as any}
/>
                        </div>
                    );
                })}
{kmlFiles.map((kmlFile, index) => {
                const fileName = kmlFile.split('/').pop()?.split('.')[0] ?? ''; 
                const iconUrl = iconMapping[fileName] ?? '';

                return <KMLLayer key={index} kmlFile={kmlFile} iconUrl={iconUrl} circleCenter={center}
                circleRadius={circleRadius}/>
            })}

        </MapContainer>
    </div>;
}