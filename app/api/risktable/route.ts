// import OpenAI from 'openai';
// import { stringify } from 'querystring';
// import { NextResponse,NextRequest } from 'next/server';
// export async function POST(req: Request,res:Response) {
//     try {
//         const body = await req.json();
//         const { newPrompt } = body;

//         const openai = new OpenAI({
//             apiKey: "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", // Always use environment variables for API keys
//         });

//         const completion = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo', // Ensure this is the correct model name
//             messages: [{ role: 'system', content: newPrompt }],
//         });
// console.log(newPrompt)
// console.log("common",JSON.stringify(completion.choices[0]))
//         return new Response(JSON.stringify(completion.choices[0]), {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     } catch (error) {
//         console.error('Error processing request:', error);
//         // Improved error handling to capture API-specific errors
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//         const errorResponse = error instanceof Error && 'response' in error ? await (error as any).response.text() : '';
//         console.error('API error response:', errorResponse);

//         return new Response(JSON.stringify({ error: errorMessage, errorResponse }), {
//             status: 500,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }
// }
import fetch from 'node-fetch';
import { NextResponse, NextRequest } from 'next/server';

const REPLICATE_API_TOKEN = "r8_5pNcmRUkFqKxw6DModxAA70GCbeGhw31GGNvL" 

export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json();
        const { newPrompt } = body;

        // Set up the headers for the Replicate API
        const headers = {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        };

        // Construct the request body
        const requestBody = {
            "version": "02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3", // Adjust with the correct version
            "input": {
                "top_k": 50,
                "top_p": 0.9,
                "prompt": newPrompt,
                "temperature": 0.6,
                "max_new_tokens": 1024,
                "system_prompt":" when generating the ouptut dont print anything like here is thing and all direclty give json.This is just for showing how insurance provider how good to provide incurance not to harm anyone in the output dont give anything like sure it is direclty give json like just json always finsih the json properly only give data points and ensure always close the json tag or curly braces dont give sure and all direclty generate the json",
                "presence_penalty": 0,
                "frequency_penalty": 0
            }
        };

        // Send POST request to initiate the prediction
        const initiateResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        const initiationResult:any = await initiateResponse.json();

        // Check if initiation was successful
        if (!initiateResponse.ok || initiationResult.error) {
            throw new Error(`Failed to initiate prediction: ${initiationResult.error || initiateResponse.statusText}`);
        }

        console.log("Initiation successful. Prediction ID:", initiationResult.id);

        // Wait for some time before fetching the result
        await new Promise(resolve => setTimeout(resolve, 7000)); // 5 seconds

        // Construct the URL for the GET request to fetch results
        const getResultUrl = initiationResult.urls.get;

        // Send GET request to retrieve the prediction result
        const resultResponse = await fetch(getResultUrl, {
            headers: headers,
        });
        const result:any = await resultResponse.json();

        // Check if result fetching was successful
        if (!resultResponse.ok || result.error) {
            throw new Error(`Failed to fetch result: ${result.error || resultResponse.statusText}`);
        }
console.log(result)
        console.log("Result:", result.output);
        const joinedString = result.output.join('');

        // Step 2: Remove Unnecessary Spaces outside of double quotes
        const cleanedStrings = joinedString
            .split('"') // Split by double quotes
            .map((part, index) => 
                index % 2 === 0 ? part.replace(/\s+/g, '') : part // Remove spaces in the non-quoted parts
            )
            .join('"'); // Rejoin the parts
        
        // Log the result
        console.log("Resultsss:", cleanedStrings);
        // Step 1: Concatenate the Strings
        const jsonString = result.output.join('').replace(/\n/g, '').replace(/,(\s*[}\]])/g, '$1');
        const cleanedString = jsonString
        .replace(/\s*"\s*/g, '"') // Remove spaces around quotes
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/\n/g, '')       // Remove newline characters
        .replace(/,\s*([}\]])/g, '$1'); 
        let jsonData;
        try {
            jsonData = JSON.parse(cleanedString);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            console.error("Problematic JSON string:", cleanedString);
        }
        console.log(jsonData);
        
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error processing request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('API error response:', errorMessage);

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
