'use client'
import React, { useState } from 'react';

const InsuranceAdvice = () => {
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchInsuranceAdvice = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/insurance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locality: "Mumbai, Andheri",
                    pricePerSqFt: 5000,
                    numFloors: 2,
                    floorArea: 600,
                    houseValue: "30,00,000 INR",
                    constructionYear: 2010
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setAdvice(data.advice);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Insurance Policy Advisor</h1>
            <button onClick={fetchInsuranceAdvice} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Get Insurance Advice'}
            </button>
            {advice && (
                <div>
                    <h3>Insurance Advice:</h3>
                    <pre>{advice}</pre>
                </div>
            )}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default InsuranceAdvice;
