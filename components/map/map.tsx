// 'use client';

// import 'leaflet/dist/leaflet.css';

// import { Icon,L } from 'leaflet';
// import { MapContainer, Marker, Popup, TileLayer,useMap,Circle ,CircleMarker } from 'react-leaflet';
// import omnivore from "@mapbox/leaflet-omnivore";
// import markerBlue from '../../public/pin-blue.svg';
// import markerRed from '../../public/pin-red.svg';
// import React,{useState,useRef,useEffect} from 'react';
// import { Circle as LeafletCircle } from 'react-leaflet';
// import { PathOptions } from 'leaflet';

// interface ExtendedCircleProps {
//   center: [number, number];
//   pathOptions?: PathOptions;
//   radius: number;
// }

// const ExtendedCircle: React.FC<ExtendedCircleProps> = (props) => {
//   return <LeafletCircle {...props} />;
// };
// const markersByColor = {
//     'red': new Icon({iconUrl: markerRed.src, iconSize: [24, 32]}),
//     'blue': new Icon({iconUrl: markerBlue.src, iconSize: [24, 32]})
// }

  
// export interface MapProps {
//     zoomLevel?: number;
//     center: [number, number];
//     markers: {
//         label: string;
//         position: [number, number];
//         color: string;
//     }[];
//     kmlFiles:string[];
//     iconMapping: { [key: string]: string }; 
// }
// const KMLLayer = ({ kmlFile, iconUrl }) => {
//     const map = useMap();

//     useEffect(() => {
//         const kmlLayer = omnivore.kml(kmlFile)
//             .on('ready', () => {
//                 kmlLayer.eachLayer((layer) => {
//                     const featureType = layer.feature.geometry.type;
//                     if (featureType === 'Point' && iconUrl) {
//                         const icon = new Icon({ iconUrl, iconSize: [24, 32] });
//                         layer.setIcon(icon);
//                     }
//                 });
//                 map.fitBounds(kmlLayer.getBounds());
//             })
//             .addTo(map);

//         return () => {
//             map.removeLayer(kmlLayer);
//         };
//     }, [kmlFile, map, iconUrl]); // Include iconUrl in the dependency array

//     return null;
// };

  
// export default function Map({center, markers,kmlFiles=[],iconMapping,zoomLevel = 17 }: MapProps) {
// const mapRef=useRef()
// const circleRadius = 5000;
//     return <div>
//         <MapContainer center={center} zoom={zoomLevel} style={{ height: '100vh' }}
//         ref={mapRef}
//         {...{} as any}
//         >
//             <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             {...{} as any}
//             />
//             {/* { markers.map((data,index) => {
//                 return <Marker
//                     position={data.position}
//                     icon={markersByColor[data?.color] ?? markersByColor['red'] }
//                     {...{} as any}
//                 >
//                     <Popup>{data.label}</Popup>
//                 </Marker>
//             })}
//           <Circle
//                                 center={data.position}
//                                 radius={circleRadius}
//                                 pathOptions={{ color: 'blue' }} // Customize the circle color
//                             /> */}
//                              {markers.map((data, index) => {
//                     return (
//                         <div key={index}>
//                             <Marker
//                                 position={data.position}
//                                 icon={markersByColor[data?.color] ?? markersByColor['red']}
//                                 {...{} as any}
//                             >
//                                 <Popup>{data.label}</Popup>
//                             </Marker>
//                             {/* Add a Circle component with a constant 5km radius */}
//                             <ExtendedCircle
//   center={data.position}
//   pathOptions={{ color: 'blue' }}
//   radius={circleRadius}
// />
//                         </div>
//                     );
//                 })}
// {kmlFiles.map((kmlFile, index) => {
//                 // Determine the icon based on the KML file name
//                 const fileName = kmlFile.split('/').pop()?.split('.')[0] ?? ''; // Safely extract 'waterdepth' from '/kml/waterdepth.kml'
//                 const iconUrl = iconMapping[fileName] ?? ''; // Safely get the corresponding icon URL from iconMapping, default to empty string if undefined

//                 return <KMLLayer key={index} kmlFile={kmlFile} iconUrl={iconUrl} />
//             })}

//         </MapContainer>
//     </div>;
// }
'use client';

import 'leaflet/dist/leaflet.css';

import { Icon,L } from 'leaflet';
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
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c; 
    console.log("pppp",distance)
    return distance;
};

const KMLLayer = ({ kmlFile, iconUrl, circleCenter, circleRadius }) => {
    const map = useMap();
    const [extractedData, setExtractedData] = useState<DataPoint[]>([]);
         useEffect(() => {
        const kmlLayer = omnivore.kml(kmlFile)
            .on('ready', () => {
                const newData: DataPoint[] = [];
                  kmlLayer.eachLayer((layer) => {
                    const featureType = layer.feature.geometry.type;
                    const properties = layer.feature.properties;
                    if (featureType === 'Point' && iconUrl) {
                        const { lat, lng } = layer.getLatLng();
                        const distance = calculateDistance(lat, lng, circleCenter[0], circleCenter[1]);
                        console.log(circleCenter[0],circleCenter[1]);
                        const icon = new Icon({ iconUrl, iconSize: [24, 32] });
                        layer.setIcon(icon);
                        if (distance <= 1) {
                            newData.push({ lat, lng, ...properties });                        }
                    }
                });
                setExtractedData((prevData) => [...prevData, ...newData]);
                map.fitBounds(kmlLayer.getBounds());
                console.log("Pramath", extractedData);
            })
            .addTo(map);

        return () => {
            map.removeLayer(kmlLayer);
        };
    }, [kmlFile, map, iconUrl, circleCenter, circleRadius]); 

    return null;
};

  
export default function Map({center, markers,kmlFiles=[],iconMapping,zoomLevel = 17 }: MapProps) {
const mapRef=useRef()
const circleRadius = 1000;
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
