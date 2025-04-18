//Gemini API configuration
const GEMINI_API_KEY = "AIzaSyAjbYo1VKBDvL0jqL4eXsYY3egBqVLI1JM";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY";


//DOM Elements
const postureInput = document.getElementById('postureInput');
const generateButton = document.getElementById('generateButton');
const problemSection = document.getElementById('problem');
const durationSelect = document.getElementById('duration');
const intensityselect = document.getElementById('intensity');
const postureInfo = document.getElementById('postureInfo');
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
    const intensity = intensityselect.value;

    if(!problem) {
        showError('Please enter a posture problem');
        return;
    }

    loadingElement.classList.remove('hidden');
    postureInfo.innerHTML = '';

    try{
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
        }`

        const response = await fetch(GEMINI_API_URL, {
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

        if (!response.ok) {
            throw new Error('Failed to get response');
        }

        const data = await response.json();
        
        // Extract the text content from the response
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Try to parse the JSON from the response text
        try {
            // Find the JSON object in the response text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                const postureData = JSON.parse(jsonStr);
                displayPostureInfo(postureData);
            } else {
                // If no JSON found, display the raw text
                postureInfo.innerHTML = `<div class="posture-card"><p>${responseText}</p></div>`;
            }
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            // If parsing fails, display the raw text
            postureInfo.innerHTML = `<div class="posture-card"><p>${responseText}</p></div>`;
        }

    } catch (error) {
        showError('Error generating solution: ' + error.message);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function displayPostureInfo(data) {
    let html = `
        <div class="posture-card">
            <h2>Posture Improvement Guide</h2>
            <p>${data.overview}</p>
        </div>
    `;
    
    // Display exercises
    html += `
    <div class="posture-card">
        <h3>Exercises</h3>
        <ul>
            ${data.exercises.map(exercise => `
                <li>
                    <strong>${exercise.name}</strong>
                    <p>${exercise.description}</p>
                    <p>Duration: ${exercise.duration}</p>
                    <p>Frequency: ${exercise.frequency}</p>
                </li>
            `).join('')}
        </ul>
    </div>
    `;
    
 //Intensity and Duration
 html += `
    <div class="posture-card">
        <h3>Intensity and Duration</h3>
        <p>Intensity: ${data.intensity}</p>
        <p>Duration: ${data.duration}</p>
    </div>
 `;
    
    // Tips and Warnings
    html += `
    <div class="tips-section">
        <h4>Crucial Tips</h4>
        <div class="tip">
            <i class="fa-solid fa-check-circle"></i>
            <p>${data.tips[0]}</p>
        </div>
        <div class="tip">
            <i class="fa-solid fa-hospital"></i>
            <p>${data.tips[0]}</p>
        </div>
        <div class="tip">
            <i class="fa-solid fa-sethoscope"></i>
            <p>${data.tips[0]}</p>
        </div>
        <div class="tip">
        <i class="fa-solid fa-notes-medical"></i>
        <p>${data.tips[0]}</p>
    </div>
    `;
    postureInfo.innerHTML = html;
}

function showError(message) {
    postureInfo.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Add error message styling
const style = document.createElement('style');
style.textContent = `
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

document.head.appendChild(style);

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

document.head.appendChild(Style);


