'use client';

import 'leaflet/dist/leaflet.css';

import { Icon,L } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer,useMap } from 'react-leaflet';
import omnivore from "@mapbox/leaflet-omnivore";
import markerBlue from '../../public/pin-blue.svg';
import markerRed from '../../public/pin-red.svg';
import React,{useState,useRef,useEffect} from 'react';
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
// const KMLLayer = ({ kmlFile, iconMapping }) => {
//     const map = useMap();
  
//     useEffect(() => {
//       const kmlLayer = omnivore.kml(kmlFile)
//         .on('ready', () => {
//           kmlLayer.eachLayer((layer) => {
//             const featureType = layer.feature.geometry.type;
//             if (featureType === 'Point') {
//               // Use the iconMapping to determine which icon to use for this point
//               const iconName = layer.feature.properties.name; 
//               console.log("hellodd",layer.feature.properties)
//               console.log("heyy",iconName)
//               const iconUrl = iconMapping[iconName];
//               console.log("hello",iconUrl)
//               if (iconUrl) {
//                 const icon = new Icon({ iconUrl, iconSize: [24, 32] });
//                 layer.setIcon(icon);
//               }
//             }
//           });
//           map.fitBounds(kmlLayer.getBounds());
//         })
//         .addTo(map);
  
//       return () => {
//         map.removeLayer(kmlLayer);
//       };
//     }, [kmlFile, map, iconMapping]);
  
//     return null;
//   };
const KMLLayer = ({ kmlFile, iconUrl }) => {
    const map = useMap();

    useEffect(() => {
        const kmlLayer = omnivore.kml(kmlFile)
            .on('ready', () => {
                kmlLayer.eachLayer((layer) => {
                    const featureType = layer.feature.geometry.type;
                    if (featureType === 'Point' && iconUrl) {
                        const icon = new Icon({ iconUrl, iconSize: [24, 32] });
                        layer.setIcon(icon);
                    }
                });
                map.fitBounds(kmlLayer.getBounds());
            })
            .addTo(map);

        return () => {
            map.removeLayer(kmlLayer);
        };
    }, [kmlFile, map, iconUrl]); // Include iconUrl in the dependency array

    return null;
};

  
export default function Map({center, markers,kmlFiles=[],iconMapping,zoomLevel = 13 }: MapProps) {
const mapRef=useRef()
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
            { markers.map(data => {
                return <Marker
                    position={data.position}
                    icon={markersByColor[data?.color] ?? markersByColor['red'] }
                    {...{} as any}
                >
                    <Popup>{data.label}</Popup>
                </Marker>
            })}
          
{kmlFiles.map((kmlFile, index) => {
                // Determine the icon based on the KML file name
                const fileName = kmlFile.split('/').pop()?.split('.')[0] ?? ''; // Safely extract 'waterdepth' from '/kml/waterdepth.kml'
                const iconUrl = iconMapping[fileName] ?? ''; // Safely get the corresponding icon URL from iconMapping, default to empty string if undefined

                return <KMLLayer key={index} kmlFile={kmlFile} iconUrl={iconUrl} />
            })}

        </MapContainer>
    </div>;
}
