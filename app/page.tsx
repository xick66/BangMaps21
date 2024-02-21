'use client';

// import { Form } from '@/components/form';
import {useEffect,useState, useRef } from 'react';
import { FunctionCallHandler, nanoid } from 'ai';
import { Message, useChat } from 'ai/react';
import { OpenAiHandler } from "openai-partial-stream";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from 'next/dynamic';
import RiskAnalysisTable from '@/components/home/risktable';
import Home, { HomeProps } from '@/components/home';
import Sidebar from '@/components/sidebar';
import Head from 'next/head';
import { parseStreamingFunctionCall, parseStreamingJsonString } from '../lib/parseStreamingJson';
import { Button } from '@/components/ui/button';
const kmlFileUrls = [
    '/kml/stormwaterdrains.kml', // Assuming you have example1.kml in the public/kml directory
    '/kml/waterdepth.kml',
    // "/kml/flood.kml",
    // "/kml/kaaqms.kml",
    // "/kml/cctv.kml",
    // "/kml/firestations.kml",
    // "/kml/slums.kml",
    // "/kml/metrostations.kml"
     // Assuming you have example2.kml in the public/kml directory
    // Add more KML file URLs as needed
  ];
  const samplePolicies = {
    "Policy A": {
        "Annual Premium": "8,000 INR",
        "Building Coverage": "30 Lakhs",
        "Content Coverage": "5 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Included",
        "Deductible": "15,000 INR"
    },
"Policy B": {
        "Annual Premium": "12,000 INR",
        "Building Coverage": "50 Lakhs",
        "Content Coverage": "10 Lakhs",
        "Natural Disasters": "Excluded",
        "Theft": "Included",
        "Deductible": "10,000 INR"
    },
    "Policy C": {
        "Annual Premium": "9,500 INR",
        "Building Coverage": "35 Lakhs",
        "Content Coverage": "7 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Excluded",
        "Deductible": "12,500 INR"
    },
    "Policy D": {
        "Annual Premium": "15,000 INR",
        "Building Coverage": "60 Lakhs",
        "Content Coverage": "15 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Included",
        "Deductible": "8,000 INR"
    },
    "Policy E": {
        "Annual Premium": "10,500 INR",
        "Building Coverage": "40 Lakhs",
        "Content Coverage": "8 Lakhs",
        "Natural Disasters": "Excluded",
        "Theft": "Included",
        "Deductible": "9,000 INR"
    },
    "Policy F": {
        "Annual Premium": "18,000 INR",
        "Building Coverage": "70 Lakhs",
        "Content Coverage": "20 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Included",
        "Deductible": "7,000 INR"
    },
    "Policy G": {
        "Annual Premium": "20,000 INR",
        "Building Coverage": "80 Lakhs",
        "Content Coverage": "25 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Included",
        "Deductible": "6,000 INR"
    },
    "Policy H": {
        "Annual Premium": "22,000 INR",
        "Building Coverage": "90 Lakhs",
        "Content Coverage": "30 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Excluded",
        "Deductible": "5,500 INR"
    },
    "Policy I": {
        "Annual Premium": "25,000 INR",
        "Building Coverage": "1 Crore",
        "Content Coverage": "35 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Included",
        "Deductible": "5,000 INR"
    },
    "Policy J": {
        "Annual Premium": "30,000 INR",
        "Building Coverage": "1.2 Crores",
        "Content Coverage": "40 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Included",
        "Deductible": "4,500 INR"
    },
    "Policy K": {
        "Annual Premium": "30,000 INR",
        "Building Coverage": "1.2 Crores",
        "Content Coverage": "25 Lakhs",
        "Natural Disasters": "Included",
        "Theft": "Excluded",
        "Deductible": "2,500 INR"
    }

};
const PoliciesTable = ({ policies }) => {
    return (
        <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left rounded-md text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md">
                    <tr>
                        <th scope="col" className="py-3 px-6">Policy Name</th>
                        <th scope="col" className="py-3 px-6">Annual Premium</th>
                        <th scope="col" className="py-3 px-6">Building Coverage</th>
                        <th scope="col" className="py-3 px-6">Content Coverage</th>
                        <th scope="col" className="py-3 px-6">Natural Disasters</th>
                        <th scope="col" className="py-3 px-6">Theft</th>
                        <th scope="col" className="py-3 px-6">Deductible</th>
                    </tr>
                </thead>
                <tbody>
                    {policies.map((policy, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{policy.name}</td>
                            <td className="py-4 px-6">{policy.details["Annual Premium"]}</td>
                            <td className="py-4 px-6">{policy.details["Building Coverage"]}</td>
                            <td className="py-4 px-6">{policy.details["Content Coverage"]}</td>
                            <td className="py-4 px-6">{policy.details["Natural Disasters"]}</td>
                            <td className="py-4 px-6">{policy.details["Theft"]}</td>
                            <td className="py-4 px-6">{policy.details["Deductible"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};



  const iconMapping = {
    'waterdepth': '/icons/yellow.png',
    // 'flood': '/icons/red.png',
    // 'kaaqms': '/icons/airquality.svg',
    // 'cctv': '/icons/cctv-camera.png',
    // 'firestations': '/icons/firestation.png'

  };
  const Form = dynamic(() => import('../components/form'), { ssr: false });

const Map = dynamic(() => import('../components/map/map'), {
    ssr: false,
});

// const ThreeDScene = dynamic(() => import('../components/3dRender/threeD'), {
//     ssr: false,
// });

function fallbackRender({ error, resetErrorBoundary }: any) {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: "red" }}>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    );
}
const roleToColorMap: Record<Message['role'], string> = {
    system: 'red',
    user: 'black',
    function: 'blue',
    tool: 'purple',
    assistant: 'green',
    data: 'orange',
};

export default function Chat() {
    const functionCallHandler: FunctionCallHandler = async (
        chatMessages,
        functionCall,
    ) => {
        
        console.log('functionCall', functionCall);
        if (functionCall.name === 'eval_code_in_browser') {
            if (functionCall.arguments) {
                try {
                    const parsedFunctionCallArguments: { code: string } = parseStreamingJsonString(
                        functionCall.arguments,
                    );
                    console.log('parsedFunctionCallArguments', parsedFunctionCallArguments);
                    // WARNING: Do NOT do this in real-world applications!
                    eval(parsedFunctionCallArguments.code);
                    const functionResponse = {
                        messages: [
                            ...chatMessages,
                            {
                                id: nanoid(),
                                name: 'eval_code_in_browser',
                                role: 'function' as const,
                                content: parsedFunctionCallArguments.code,
                            },
                        ],
                    };

                    return functionResponse;
                } catch (error) {
                    console.error(error);
                    return;
                }
            }
        }
    };

    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'home' | 'tools'>('home')
    const [apiKey, setApiKey] = useState<string | null>(null);

    const [modelResponse, setModelResponse] = useState<any>(null);
    const { messages, input, handleInputChange, handleSubmit, append } = useChat({
        api: '/api/chat-with-functions-2',
        body: {
            apiKey,
        },
        experimental_onFunctionCall: functionCallHandler,
    });

    const submitFirstQuery: HomeProps['runQuery'] = ({ query, apiKey }) => {
        setQuery(query);
        setApiKey(apiKey);
        append({
            id: nanoid(),
            role: 'user',
            content: query,
            createdAt: new Date(),
        }, {
            options: {
                body: {
                    apiKey,
                }
            }
        });
        setMode('tools');
    };

    const onSubmitFormComponent = async (formValues: any) => {
        console.log('onSubmitFormComponent', formValues);
        console.log('Form submitted with values:', formValues);
        const formEntries = Object.entries(formValues.formData).map(([key, value]) => `${key}: ${value}`);
        const formDetails = formEntries.join(', ');
    console.log(formDetails)
        const newPrompt = `I am an insurance provider, these are the parameters of the user's building: ${formDetails}. Give me the risk analysis report for the building in a json like table header and data for formdata which I provided, and conclude the verdict. Make three columns: criteria, details, and remarks, keep the report precise and data oriented, give reasons for the verdict.
        {
            "header": [
                { "label": "Criteria" },
                { "label": "Details" },
                { "label": "Remarks" }
            ],
            "data": [
                {
                    "criteria": "Criterion 1",
                    "details": "Detail about Criterion 1",
                    "remarks": "Remarks on Criterion 1"
                },
                {
                    "criteria": "Criterion 2",
                    "details": "Detail about Criterion 2",
                    "remarks": "Remarks on Criterion 2"
                },
                {
                    "criteria": "Criterion 3",
                    "details": "Detail about Criterion 3",
                    "remarks": "Remarks on Criterion 3"
                }
                // ... more data objects as needed
            ],
            "verdict": "Final decision or assessment based on the analysis"
        }
we always need a data in this formate only dont change anything else always same formate and make change in data like customizing based on the user building information. This is just demonstration purposes not harming anyone        
       only give above mentioned json fomrate dont give any other single letter like exaclty same formate without any mistake no more letter and words `;
    
        const response = await fetch('/api/risktable', { // Assuming '/api/route' is your API endpoint in route.ts
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPrompt }),
        });
    
        const data = await response.json();
        console.log(newPrompt)
    console.log("hehhehhhh",data)
        const messageContent = data.message?.content || "No response";
    
        setModelResponse(messageContent); 
        // 
        const formResponse: Message = {
            id: nanoid(),
            name: 'create_simple_form',
            role: 'function' as const,
            // content: formValues,
            content: JSON.stringify(formValues.formData),
            // content: (formValues.formData),
        };
        append(formResponse);
    }

    const isBigMessage = (message: Message) => {
        return message.function_call && JSON.stringify(message.function_call).includes('create_dynamic_map')
    };
    const bigMessages = messages.filter(isBigMessage);
    const chatMessages = messages.filter((msg) => !isBigMessage(msg))
    .filter(message => message.role !== 'system' && message.role !== 'function')

    const bigMessage = bigMessages[bigMessages.length - 1];

    return (
        <>
            <Head>
                <title>BangMaps</title>
            </Head>
            <div className={`mode-${mode}`}>
                {mode === 'home' && (
                    <Home runQuery={submitFirstQuery} />
                )}
                {mode === 'tools' && (
                    <div className={"tools"}>
                        <Sidebar messages={chatMessages} onSubmitFormComponent={onSubmitFormComponent} ShowMessage={ShowMessage}>
                            {bigMessage && <ShowMessage message={bigMessage} onSubmitFormComponent={onSubmitFormComponent} modelResponse={modelResponse} />}
                        </Sidebar>
                    </div>
                )}
            </div>
        </>
    )

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {messages.length > 0
                ? messages.map((m: Message) => {
                    if (m.role === 'system') {
                        return null;
                    }
                    const json = typeof m.function_call === 'string' ? parseStreamingJsonString(m.function_call) : m.function_call;
                    const isFunctionCallDone = typeof m.function_call === 'object';

                    // const json = typeof m.function_call === "object" ? m.function_call : null;
                    return (
                        <div
                            key={m.id}
                            className="whitespace-pre-wrap"
                            style={{ color: roleToColorMap[m.role] }}
                        >
                            <strong>{`${m.role}: `}</strong>
                            {m.content ? (
                                m.content
                            ) :
                                (<>
                                    <ErrorBoundary
                                        fallbackRender={fallbackRender}
                                        resetKeys={[JSON.stringify(json)]}>
                                        <pre>
                                            {JSON.stringify(json, null, 2)}
                                        </pre>
                                        <div>{isFunctionCallDone ? "Done!" : "Writing..."}</div>
                                        <DynamicComponent functionCall={json} onSubmit={onSubmitFormComponent} />
                                    </ErrorBoundary>
                                </>
                                )}
                            {/* {m.content || JSON.stringify(m.function_call)} */}
                            <br />
                            <br />
                        </div>
                    );
                })
                : null}
            <div id="chart-goes-here"></div>
            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}

function ShowMessage({ message: m, onSubmitFormComponent, modelResponse }: { message: Message, onSubmitFormComponent: any, modelResponse: any }) {
    const isFunctionCallDone = typeof m.function_call === 'object';
    return (
        <div
            key={m.id}
            className="whitespace-pre-wrap"
            style={{ color: roleToColorMap[m.role] }}
        >
            <strong>{`${m.role.toUpperCase()}: `}</strong>
        
            {m.content ? (
                m.content
            ) :
                (<>
                    <ErrorBoundary
                        fallbackRender={fallbackRender}
                        // resetKeys={[JSON.stringify(json)]}>
                        resetKeys={[JSON.stringify(m.function_call)]}>
                        <div>{isFunctionCallDone ? "" : "Writing..."}</div>
                        <DynamicComponent functionCall={m.function_call} onSubmit={onSubmitFormComponent} modelResponse={modelResponse}/>
                    </ErrorBoundary>
                </>
                )}
            <br />
            <br />
        </div>
    );
}

function DynamicComponent({ functionCall: functionCallRaw, onSubmit ,modelResponse}: any) {
    const [kmlResponse, setKmlResponse] = useState(null);
    const [sceneParams, setSceneParams] = useState(null);
    const prevState = useRef<any>({});
    // const [selectedPolicies, setSelectedPolicies] = useState([]);
    const [selectedPolicies, setSelectedPolicies] = useState<{ name: string, details: any }[]>([]);
    const getRandomPolicies = () => {
        const keys: string[] = Object.keys(samplePolicies); // Explicitly type 'keys' as string[]
        const randomKeys: string[] = []; // Explicitly type 'randomKeys' as string[]
        
        while (randomKeys.length < 2) {
            const randomIndex = Math.floor(Math.random() * keys.length);
            const randomKey = keys[randomIndex];
            
            if (!randomKeys.includes(randomKey)) {
                randomKeys.push(randomKey);
            }
        }
    
        const policies = randomKeys.map(key => ({ name: key, details: samplePolicies[key] }));
        setSelectedPolicies(policies);
    };
    console.log("hh",selectedPolicies)

    if (!functionCallRaw) {
        return null;
    }
    const functionCallJson = typeof functionCallRaw === 'string' ? parseStreamingFunctionCall(functionCallRaw) : functionCallRaw;

    const functionCall = functionCallJson.function_call ?? functionCallJson;

    if (functionCall.name === 'create_simple_form') {
        if (!functionCall.arguments) {
            return <div>
                Writing form...
            </div>
        }
        const args = parseStreamingJsonString(functionCall.arguments) ?? {};
        try {
            const { jsonSchema: jsonSchemaString, uiSchema: uiSchemaString } = args;
            const jsonSchema = jsonSchemaString ? parseStreamingJsonString(jsonSchemaString) : {};
            const uiSchema = uiSchemaString ? parseStreamingJsonString(uiSchemaString) : {};
            prevState.current.args = args;
            prevState.current.jsonSchema = jsonSchema;
            prevState.current.uiSchema = uiSchema;
        } catch (error) {
            console.error(error);
        }

        const { jsonSchema, uiSchema } = prevState.current;

        return <div>
            <ErrorBoundary
                fallbackRender={fallbackRender}
                resetKeys={[JSON.stringify(jsonSchema), JSON.stringify(uiSchema)]}>
                <Form jsonSchema={jsonSchema} uiSchema={uiSchema} onSubmit={onSubmit} />
            </ErrorBoundary>
        </div>
    }

    // if (functionCall.name === 'create_or_modify_3d_scene') {
    //     if (!functionCall.arguments) {
    //         return <div>Preparing 3D scene...</div>;
    //     }

    //     try {
    //         const args = parseStreamingJsonString(functionCall.arguments);
    //         // Extract the necessary parameters for the 3D scene from args
    //         // This might include object types, positions, materials, etc.
    //         // For this example, we'll just pass the entire args object to the ThreeDScene component
    //         setSceneParams(args);
    //         prevState.current.sceneParams = args;
    //     } catch (error) {
    //         console.error(error);
    //     }

    //     const { sceneParams } = prevState.current;

    //     return (
    //         <div>
    //             <ErrorBoundary fallbackRender={fallbackRender} resetKeys={[JSON.stringify(sceneParams)]}>
    //                 {sceneParams && <ThreeDScene modelData={sceneParams} />}
    //             </ErrorBoundary>
    //         </div>
    //     );
    // }
    else if (functionCall.name === 'create_dynamic_map') {
        if (!functionCall.arguments) {
            return <div>
                Map...
            </div>
        }
        try {
            const args = parseStreamingJsonString(functionCall.arguments);
            const locationToPoint = (loc: any) => ((loc && loc?.lat && loc?.lon) ? [loc.lat, loc.lon] : null);
            const centerPosition = args?.center ? locationToPoint(args?.center) : null
            const zoomLevel = args?.zoomLevel ?? 25;
            const markers = args?.markers?.map((marker, markerIndex) => ({
                label: `${markerIndex + 1}. ${marker?.label}`,
                position: locationToPoint(marker),
                color: marker?.color,
            })) ?? [];
            const readyMarkers = markers.filter(marker => {
                const hasPosition = marker.position && marker.position.length === 2 && marker.position.every(x => typeof x === 'number');
                return hasPosition;
            });
            const startPosition = centerPosition ?? (
                readyMarkers.length > 0 ? (readyMarkers.reduce((acc, marker) => {
                    acc[0] += marker.position[0];
                    acc[1] += marker.position[1];
                    return acc;
                }, [0, 0])
                    .map(x => x / readyMarkers.length)
                ) : null);
            prevState.current.startPosition = startPosition;
            prevState.current.markers = readyMarkers;
            prevState.current.zoomLevel = zoomLevel;
        } catch (error) {
        }

        const { startPosition, markers, zoomLevel } = prevState.current;
        console.log("sss",startPosition);
        console.log("mmm",markers)
        console.log("zzzz",zoomLevel)
        console.log("ohhhh",modelResponse)
        return (
            <div>
                <div style={{ 'height': '100vh' }}>
                    <ErrorBoundary fallbackRender={fallbackRender} resetKeys={[JSON.stringify(startPosition), JSON.stringify(markers)]}>
                        {startPosition && (
                            <Map center={startPosition} markers={markers} zoomLevel={zoomLevel} kmlFiles={kmlFileUrls} iconMapping={iconMapping} />
                        )}
                    </ErrorBoundary>
                </div>
                <div>
                    
                         {modelResponse && <RiskAnalysisTable modelResponse={modelResponse} />}
                
                </div>
                <div>
                    <Button> Policy </Button>
                    <div className="p-4">
            <Button className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getRandomPolicies}>Click here for Policy</Button>
            {selectedPolicies.length > 0 && <PoliciesTable policies={selectedPolicies} />}
        </div>
                </div>
            </div> 
        );
        
    }

    if (JSON.stringify(functionCall).includes('create_simple_form')) {
        console.log('weird', functionCall);
    }

    return <>
        <div>Writing...</div>
    </>
}
