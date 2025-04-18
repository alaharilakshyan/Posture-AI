//Gemini API configuration
const GEMINI_API_KEY = "AIzaSyD49e6J6JkykoYtBco_cbjE4rjYImT_WzA";
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


//DOM Elements
const postureInput = document.getElementById('postureInput');
const generateButton = document.getElementById('generateButton');
const problemSelect = document.getElementById('Problem');
const durationSelect = document.getElementById('duration');
const intensitySelect = document.getElementById('intensity');
const postureInfo = document.getElementById('PostureInfo');
const loadingElement = document.getElementById('loading');

//Event Listeners

generateButton.addEventListener('click', generatePostureSolution);
postureInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter'){
        generatePostureSolution();
    }
});

async function generatePostureSolution() {
    const problem = postureInput.value.trim();
    const duration = durationSelect.value;
    const intensity = intensitySelect.value;

    if(!problem) {
        showError('Please enter a posture problem');
        return;
    }

    loadingElement.classList.remove('hidden');
    postureInfo.innerHTML = '';

    try{
        console.log('Sending request to Gemini API...');
        const prompt = `Create a concise and effective posture improvement guide for ${problem} with these preferences:
        Duration: ${duration || 'flexible'} days
        Intensity: ${intensity || 'moderate'}

        Format the response as a JSON object with the following structure:
        {
            "overview": "Brief overview of the posture problem and solution",
            "exercises": [
                {
                    "name": string,
                    "description": string,
                    "duration": string,
                    "frequency": string
                }
            ],
            "tips": [string],
            "warnings": [string],
            "intensity": "${intensity || 'moderate'}",
            "duration": "${duration || 'flexible'}"
        }

        Ensure the response is strictly in JSON format.`;

        console.log('API URL:', GEMINI_API_URL);
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Details:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText
            });
            throw new Error(`API request failed: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Extract the text content from the response
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('Response text:', responseText);
        
        // Try to parse the JSON from the response text
        try {
            // Find the JSON object in the response text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                console.log('Extracted JSON:', jsonStr);
                const postureData = JSON.parse(jsonStr);
                console.log('Parsed data:', postureData);
                displayPostureInfo(postureData);
            } else {
                console.log('No JSON found in response');
                // If no JSON found, display the raw text
                postureInfo.innerHTML = `<div class="posture-card"><p>${responseText}</p></div>`;
            }
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            // If parsing fails, display the raw text
            postureInfo.innerHTML = `<div class="posture-card"><p>${responseText}</p></div>`;
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Error generating solution: ' + error.message);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function displayPostureInfo(data) {
    try {
        if (!postureInfo) throw new Error('Posture info element not found');

        let html = '<div class="posture-card">';
        
        // Overview Section
        html += `
            <h2>Posture Overview</h2>
            <p>${data.overview || 'No overview available.'}</p>
        `;

        // Exercises Section
        if (data.exercises && data.exercises.length > 0) {
            html += '<h3>Recommended Exercises</h3><ul>';
            data.exercises.forEach(exercise => {
                html += `
                    <li>
                        <strong>${exercise.name}</strong>
                        <p>${exercise.description}</p>
                        <div class="schedule-info">
                            <div class="schedule-item">
                                <i class="fas fa-clock"></i>
                                <span>Duration: ${exercise.duration || '20 minutes'}</span>
                            </div>
                            <div class="schedule-item">
                                <i class="fas fa-redo"></i>
                                <span>Frequency: ${exercise.frequency || '3 times daily'}</span>
                            </div>
                        </div>
                    </li>
                `;
            });
            html += '</ul>';
        }

        // Daily Schedule Section
        html += `
            <h3>Daily Schedule</h3>
            <div class="schedule-info">
                <div class="schedule-item">
                    <i class="fas fa-sun"></i>
                    <span>Morning Session: 20 minutes</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-cloud-sun"></i>
                    <span>Afternoon Session: 20 minutes</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-moon"></i>
                    <span>Evening Session: 20 minutes</span>
                </div>
            </div>
        `;

        // Tips Section
        if (data.tips && data.tips.length > 0) {
            html += `
                <div class="tips-section">
                    <h4>Helpful Tips</h4>
                    ${data.tips.map(tip => `
                        <div class="tip">
                            <i class="fas fa-lightbulb"></i>
                            <span>${tip}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Warnings Section
        if (data.warnings && data.warnings.length > 0) {
            html += `
                <div class="tips-section warnings">
                    <h4>Important Warnings</h4>
                    ${data.warnings.map(warning => `
                        <div class="tip warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>${warning}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        html += '</div>'; // Close posture-card
        postureInfo.innerHTML = html;
    } catch (error) {
        console.error('Error displaying posture information:', error);
        postureInfo.innerHTML = '<div class="error">Error displaying posture information. Please try again.</div>';
    }
}

function showError(message) {
    postureInfo.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Add error message styling
const errorStyle = document.createElement('style');
errorStyle.textContent = `
    .error-message {
        background-color: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }

    .error-message p {
        margin: 0.5rem 0;
    }
`;

document.head.appendChild(errorStyle);

// Add project card styling
const projectStyle = document.createElement('style');
projectStyle.textContent = `
    .project-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin: 1rem 0;
        transition: transform 0.3s ease;
    }

    .project-card:hover {
        transform: translateY(-5px);
    }

    .posture-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin: 1rem 0;
    }

    .posture-card h2, .posture-card h3 {
        color: #333;
        margin-top: 0;
    }

    .posture-card ul {
        padding-left: 1.5rem;
    }

    .posture-card li {
        margin-bottom: 1rem;
    }

    .tips-section {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 1rem 0;
    }

    .tip {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }

    .tip i {
        margin-right: 1rem;
        color: #4caf50;
        font-size: 1.2rem;
    }

    .tip p {
        margin: 0;
    }
`;

document.head.appendChild(projectStyle);


