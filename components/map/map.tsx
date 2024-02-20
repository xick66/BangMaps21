'use client';

import 'leaflet/dist/leaflet.css';

import L, { Icon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer,useMap,Circle ,CircleMarker } from 'react-leaflet';
import omnivore from "@mapbox/leaflet-omnivore";
import markerBlue from '../../public/pin-blue.svg';
import markerRed from '../../public/pin-red.svg';
import React,{useState,useRef,useEffect} from 'react';
import { Circle as LeafletCircle } from 'react-leaflet';
import { PathOptions } from 'leaflet';

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
const circleRadius = 1000;
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
  radius={circleRadius}
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