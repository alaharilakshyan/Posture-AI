// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyBYE4hRDfskZ9bxY1avf972xnwQGIQuYaQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const exploreButton = document.getElementById('exploreButton');
const durationSelect = document.getElementById('duration');
const interestsSelect = document.getElementById('interests');
const budgetSelect = document.getElementById('budget');
const cityInfo = document.getElementById('cityInfo');
const loadingElement = document.getElementById('loading');

// Event Listeners
exploreButton.addEventListener('click', exploreCity);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        exploreCity();
    }
});

async function exploreCity() {
    const city = cityInput.value.trim();
    const duration = durationSelect.value;
    const interests = interestsSelect.value;
    const budget = budgetSelect.value;

    if (!city) {
        showError('Please enter a city name');
        return;
    }

    loadingElement.classList.remove('hidden');
    cityInfo.innerHTML = '';

    try {
        const prompt = `Create a concise travel guide for ${city} with these preferences:
        Duration: ${duration || 'flexible'} days
        Focus: ${interests || 'general'}
        Budget: ${budget || 'moderate'}

        Format as JSON:
        {
            "overview": "Brief city intro",
            "highlights": [
                {
                    "name": "Attraction name",
                    "time": "Best time to visit",
                    "duration": "Visit duration",
                    "cost": "Cost range"
                }
            ],
            "schedule": [
                {
                    "day": "Day number",
                    "morning": "Morning activity",
                    "afternoon": "Afternoon activity",
                    "evening": "Evening activity"
                }
            ],
            "food": [
                {
                    "name": "Dish name",
                    "place": "Where to try",
                    "price": "Price range"
                }
            ],
            "tips": {
                "transport": "Transportation tips",
                "safety": "Safety advice",
                "budget": "Budget tips",
                "customs": "Local customs"
            }
        }`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 20,
                    topP: 0.9,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API request failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid API response structure');
        }

        const content = data.candidates[0].content.parts[0].text;
        const cleanContent = content.trim().replace(/^```json\s*|\s*```$/g, '');
        const cityData = JSON.parse(cleanContent);
        
        displayCityInfo(cityData);
    } catch (error) {
        console.error('Error:', error);
        showError(`Error: ${error.message}`);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function displayCityInfo(cityData) {
    let html = `
        <div class="city-card">
            <h3>${cityInput.value}</h3>
            <p>${cityData.overview}</p>
        </div>
    `;

    // Display highlights
    html += `
        <div class="city-card">
            <h3>Top Highlights</h3>
            <ul>
                ${cityData.highlights.map(highlight => `
                    <li>
                        <strong>${highlight.name}</strong>
                        <p>Best time: ${highlight.time}</p>
                        <p>Duration: ${highlight.duration}</p>
                        <p>Cost: ${highlight.cost}</p>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    // Display daily schedule
    html += '<div class="itinerary-section">';
    cityData.schedule.forEach(day => {
        html += `
            <div class="day-schedule">
                <h4>${day.day}</h4>
                <div class="time-slot">
                    <div class="time">Morning</div>
                    <div class="activity">${day.morning}</div>
                </div>
                <div class="time-slot">
                    <div class="time">Afternoon</div>
                    <div class="activity">${day.afternoon}</div>
                </div>
                <div class="time-slot">
                    <div class="time">Evening</div>
                    <div class="activity">${day.evening}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';

    // Display food recommendations
    html += `
        <div class="city-card">
            <h3>Local Cuisine</h3>
            <ul>
                ${cityData.food.map(dish => `
                    <li>
                        <strong>${dish.name}</strong>
                        <p>Where to try: ${dish.place}</p>
                        <p>Price: ${dish.price}</p>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    // Display tips
    html += `
        <div class="tips-section">
            <h4>Essential Tips</h4>
            <div class="tip">
                <i class="fas fa-bus"></i>
                <div>
                    <strong>Transportation</strong>
                    <p>${cityData.tips.transport}</p>
                </div>
            </div>
            <div class="tip">
                <i class="fas fa-shield-alt"></i>
                <div>
                    <strong>Safety</strong>
                    <p>${cityData.tips.safety}</p>
                </div>
            </div>
            <div class="tip">
                <i class="fas fa-wallet"></i>
                <div>
                    <strong>Budget Tips</strong>
                    <p>${cityData.tips.budget}</p>
                </div>
            </div>
            <div class="tip">
                <i class="fas fa-handshake"></i>
                <div>
                    <strong>Local Customs</strong>
                    <p>${cityData.tips.customs}</p>
                </div>
            </div>
        </div>
    `;

    cityInfo.innerHTML = html;
}

function showError(message) {
    cityInfo.innerHTML = `
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
    
    .no-results {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .project-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .project-details {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
    }
    
    .difficulty, .grade-level, .category {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
    }
    
    .difficulty.easy { background-color: #e8f5e9; color: #2e7d32; }
    .difficulty.medium { background-color: #fff3e0; color: #e65100; }
    .difficulty.hard { background-color: #ffebee; color: #c62828; }
    
    .materials ul {
        list-style-type: none;
        padding: 0;
    }
    
    .materials li {
        padding: 0.5rem;
        background: #f5f5f5;
        margin: 0.25rem 0;
        border-radius: 4px;
    }
`;
document.head.appendChild(style); 