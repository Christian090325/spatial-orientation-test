/**
 * Spatial Orientation Test (SOT)
 * A web-based implementation based on the Hegarty Lab version
 */

// Define the objects in the environment
const objects = [
    { id: 'bell', name: 'bell', src: 'assets/objects/bell.svg' },
    { id: 'tree', name: 'tree', src: 'assets/objects/tree.svg' },
    { id: 'drum', name: 'drum', src: 'assets/objects/drum.svg' },
    { id: 'wheel', name: 'wheel', src: 'assets/objects/wheel.svg' },
    { id: 'traffic-light', name: 'traffic light', src: 'assets/objects/traffic-light.svg' },
    { id: 'trash-can', name: 'trash can', src: 'assets/objects/trash-can.svg' },
    { id: 'barrel', name: 'barrel', src: 'assets/objects/barrel.svg' }
];

// Define the test trials - matching the examples from screenshots
const testTrials = [
    { id: 1, standing: 'bell', facing: 'tree', pointing: 'drum' },
    { id: 2, standing: 'tree', facing: 'bell', pointing: 'trash-can' },
    { id: 3, standing: 'traffic-light', facing: 'drum', pointing: 'trash-can' },
    { id: 4, standing: 'barrel', facing: 'drum', pointing: 'wheel' },
    { id: 5, standing: 'barrel', facing: 'trash-can', pointing: 'bell' },
    { id: 6, standing: 'trash-can', facing: 'bell', pointing: 'traffic-light' },
    { id: 7, standing: 'wheel', facing: 'barrel', pointing: 'traffic-light' },
    { id: 8, standing: 'traffic-light', facing: 'bell', pointing: 'wheel' },
    { id: 9, standing: 'drum', facing: 'tree', pointing: 'wheel' },
    { id: 10, standing: 'drum', facing: 'trash-can', pointing: 'barrel' },
    { id: 11, standing: 'trash-can', facing: 'drum', pointing: 'tree' },
    { id: 12, standing: 'bell', facing: 'trash-can', pointing: 'barrel' }
];

// Practice trials
const practiceTrials = [
    { id: 'p1', standing: 'bell', facing: 'tree', pointing: 'drum' },
    { id: 'p2', standing: 'tree', facing: 'bell', pointing: 'trash-can' },
    { id: 'p3', standing: 'trash-can', facing: 'bell', pointing: 'wheel' }
];

// Global variables for tracking test state
let currentTrial = 0;
let responses = [];
let startTime = 0;
let testTimer = null;
let timeRemaining = 300; // 5 minutes in seconds
let objectImages = {};
let isInQualtrics = false;
let currentAngle = 0;

// Fixed positions of objects in the scene
const objectPositions = [
    { id: 'wheel', x: 50, y: 20 },       // Wheel at top center
    { id: 'traffic-light', x: 25, y: 35 }, // Traffic light at middle left
    { id: 'barrel', x: 75, y: 40 },      // Barrel at middle right
    { id: 'trash-can', x: 20, y: 65 },   // Trash can at bottom left
    { id: 'tree', x: 80, y: 80 },        // Tree at bottom right
    { id: 'drum', x: 50, y: 65 },        // Drum at bottom center
    { id: 'bell', x: 50, y: 50 }         // Bell at center
];

// Preload all images
function preloadImages() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        
        objects.forEach(object => {
            const img = new Image();
            img.onload = () => {
                objectImages[object.id] = img;
                loadedCount++;
                if (loadedCount === objects.length) {
                    resolve();
                }
            };
            img.src = object.src;
        });
    });
}

// Initialize the test
async function initSpatialOrientationTest(inQualtrics = false) {
    isInQualtrics = inQualtrics;
    
    // Show loading indicator
    document.getElementById('sot-container').innerHTML = `
        <div style="text-align: center; margin-top: 100px;">
            <span>Loading test materials...</span>
        </div>
    `;
    
    // Preload images
    await preloadImages();
    
    // Show welcome screen
    showWelcomeScreen();
}

// Display the welcome screen
function showWelcomeScreen() {
    document.getElementById('sot-container').innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;">
            <h2>Spatial Orientation Test</h2>
            <p>This test measures your ability to imagine different perspectives or orientations in space.</p>
            <p>You will see a configuration of objects. For each problem, you need to imagine you are standing at one object, facing another, and then point to a third object.</p>
            <p>You will use the mouse to draw a line showing the direction to the third object.</p>
            
            <div style="margin-top: 30px;">
                <button id="start-button" style="padding: 8px 16px; cursor: pointer;">Begin Practice Trials</button>
            </div>
        </div>
    `;
    
    document.getElementById('start-button').addEventListener('click', showPracticeInstructions);
}

// Show practice instructions
function showPracticeInstructions() {
    document.getElementById('sot-container').innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;">
            <h2>Practice Trials</h2>
            <p>Now you will do three practice trials. When each trial appears, move the line to indicate your answer.</p>
            <p>Once you have entered your answer the correct answer will be shown in red.</p>
            <p>Press SPACE BAR to see the first practice trial.</p>
        </div>
    `;
    
    // Use space bar to proceed, like in the original test
    document.addEventListener('keydown', function spaceHandler(e) {
        if (e.code === 'Space') {
            document.removeEventListener('keydown', spaceHandler);
            startPracticeTrial(0);
        }
    });
}

// Start a practice trial
function startPracticeTrial(index) {
    if (index >= practiceTrials.length) {
        showTestInstructions();
        return;
    }
    
    const trial = practiceTrials[index];
    
    document.getElementById('sot-container').innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; padding: 20px; display: flex;">
            <div style="flex: 2; margin-right: 20px;">
                <div id="objects-scene" style="position: relative; width: 100%; height: 400px; background: white; border: 1px solid black;">
                    <!-- Objects will be placed here -->
                </div>
                <p style="margin-top: 15px; text-align: left;">
                    Imagine you are standing at the ${getObjectName(trial.standing)} and facing the ${getObjectName(trial.facing)}. 
                    Point to the ${getObjectName(trial.pointing)}.
                </p>
                <p style="text-align: left;">Please press ENTER when finished.</p>
            </div>
            <div style="flex: 1;">
                <div id="response-area" style="position: relative; width: 300px; height: 300px;">
                    <canvas id="response-canvas" width="300" height="300" style="border: 1px solid black;"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Place objects in the scene - fixed positions like in the original
    const container = document.getElementById('objects-scene');
    placeObjectsInScene(container);
    
    // Set up the response canvas
    setupResponseCanvas(trial.standing, trial.facing);
    
    // Handle submission with ENTER key
    document.addEventListener('keydown', function enterHandler(e) {
        if (e.code === 'Enter') {
            document.removeEventListener('keydown', enterHandler);
            
            // Calculate the correct angle
            const correctAngle = calculateCorrectAngle(trial.standing, trial.facing, trial.pointing);
            
            // Show correct answer
            showCorrectAnswer(correctAngle);
            
            // Wait 2 seconds and move to next trial
            setTimeout(() => {
                startPracticeTrial(index + 1);
            }, 2000);
        }
    });
}

// Show test instructions
function showTestInstructions() {
    document.getElementById('sot-container').innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;">
            <h2>Main Test</h2>
            <p>Now you will do the test. There are 12 items on this test. You will have 5 minutes to complete these items.</p>
            <p>Please try to respond accurately, but do not spend too much time on any one item.</p>
            <p>When you are ready to start, press ENTER.</p>
        </div>
    `;
    
    // Use Enter key to start the test
    document.addEventListener('keydown', function enterHandler(e) {
        if (e.code === 'Enter') {
            document.removeEventListener('keydown', enterHandler);
            startTest();
        }
    });
}

// Start the main test
function startTest() {
    // Reset test variables
    currentTrial = 0;
    responses = [];
    startTime = Date.now();
    
    // Start the timer
    timeRemaining = 300; // 5 minutes
    testTimer = setInterval(updateTimer, 1000);
    
    // Show the first test trial
    showTestTrial();
}

// Update the timer
function updateTimer() {
    timeRemaining--;
    
    if (timeRemaining <= 0) {
        clearInterval(testTimer);
        finishTest();
    }
}

// Show a test trial
function showTestTrial() {
    if (currentTrial >= testTrials.length) {
        finishTest();
        return;
    }
    
    const trial = testTrials[currentTrial];
    
    document.getElementById('sot-container').innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; padding: 20px; display: flex;">
            <div style="flex: 2; margin-right: 20px;">
                <div id="objects-scene" style="position: relative; width: 100%; height: 400px; background: white; border: 1px solid black;">
                    <!-- Objects will be placed here -->
                </div>
                <p style="margin-top: 15px; text-align: left;">
                    Imagine you are standing at the ${getObjectName(trial.standing)} and facing the ${getObjectName(trial.facing)}. 
                    Point to the ${getObjectName(trial.pointing)}.
                </p>
                <p style="text-align: left;">Please press ENTER when finished.</p>
            </div>
            <div style="flex: 1;">
                <div id="response-area" style="position: relative; width: 300px; height: 300px;">
                    <canvas id="response-canvas" width="300" height="300" style="border: 1px solid black;"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Place objects in the scene - fixed positions like in the screenshots
    const container = document.getElementById('objects-scene');
    placeObjectsInScene(container);
    
    // Set up the response canvas
    setupResponseCanvas(trial.standing, trial.facing);
    
    // Handle submission with ENTER key
    document.addEventListener('keydown', function enterHandler(e) {
        if (e.code === 'Enter') {
            document.removeEventListener('keydown', enterHandler);
            
            // Record response
            const responseTime = (Date.now() - startTime) / 1000;
            
            // Calculate the correct angle for this trial
            const correctAngle = calculateCorrectAngle(trial.standing, trial.facing, trial.pointing);
            
            // Calculate angular error (difference between response and correct angle)
            let angularError = Math.abs(currentAngle - correctAngle);
            // Convert to smallest angle (0-180 range)
            if (angularError > 180) {
                angularError = 360 - angularError;
            }
            
            responses.push({
                trialId: trial.id,
                standing: trial.standing,
                facing: trial.facing,
                pointing: trial.pointing,
                responseAngle: currentAngle,
                correctAngle: correctAngle,
                angularError: angularError,
                responseTime: responseTime
            });
            
            // TEMPORARILY show the red line for the correct answer in all trials
            // for testing purposes
            showCorrectAnswer(correctAngle);
            
            // Wait 2 seconds to view the correct answer before moving to next trial
            setTimeout(() => {
                currentTrial++;
                showTestTrial();
            }, 2000);
        }
    });
}

// Calculate the correct angle between objects based on their positions
function calculateCorrectAngle(standingId, facingId, pointingId) {
    // Find the positions of the three objects
    const standingPos = objectPositions.find(pos => pos.id === standingId);
    const facingPos = objectPositions.find(pos => pos.id === facingId);
    const pointingPos = objectPositions.find(pos => pos.id === pointingId);
    
    if (!standingPos || !facingPos || !pointingPos) {
        console.error('Cannot find positions for objects:', standingId, facingId, pointingId);
        return 0;
    }
    
    // In a spatial orientation test, we need to determine the angle from the perspective
    // of someone standing at the standing object and facing the facing object
    
    // Step 1: Create a local coordinate system where:
    // - The origin is at the standing object
    // - The positive y-axis (0 degrees) points toward the facing object
    
    // First, get the direction vector from standing to facing
    let facingDirX = facingPos.x - standingPos.x;
    let facingDirY = facingPos.y - standingPos.y;
    
    // Normalize this vector (make it unit length)
    const facingLength = Math.sqrt(facingDirX * facingDirX + facingDirY * facingDirY);
    facingDirX /= facingLength;
    facingDirY /= facingLength;
    
    // Step 2: Get the vector from standing to pointing
    let pointingVecX = pointingPos.x - standingPos.x;
    let pointingVecY = pointingPos.y - standingPos.y;
    
    // Step 3: In our coordinate system, the facing direction is our reference (0 degrees)
    // We need to find the angle between these two vectors
    
    // The y-axis is inverted in screen coordinates (0 at top, increases downward)
    
    // For the dot product calculation
    const dotProduct = facingDirX * pointingVecX + facingDirY * pointingVecY;
    
    // For the cross product calculation (in 2D, it's a scalar)
    const crossProduct = facingDirX * pointingVecY - facingDirY * pointingVecX;
    
    // Calculate the angle using atan2
    // This gives us the signed angle between the vectors
    let angle = Math.atan2(crossProduct, dotProduct) * (180 / Math.PI);
    
    // Adjust to get the clockwise angle from the facing direction
    angle = -angle;
    
    // Normalize to 0-360 range
    angle = (angle + 360) % 360;
    
    // Mirror the angle as required for proper perspective
    // This flips the angle to the opposite side of the circle
    angle = (180 + angle) % 360;
    
    return angle;
}

// Place objects in the scene - use fixed positions to match the screenshots
function placeObjectsInScene(container) {
    // Place all objects
    objectPositions.forEach(pos => {
        const obj = objects.find(o => o.id === pos.id);
        if (obj) {
            const objectElement = document.createElement('div');
            objectElement.className = 'scene-object';
            objectElement.style.left = `${pos.x}%`;
            objectElement.style.top = `${pos.y}%`;
            
            const img = document.createElement('img');
            img.src = obj.src;
            img.alt = obj.name;
            img.width = 40;
            img.height = 40;
            
            objectElement.appendChild(img);
            container.appendChild(objectElement);
        }
    });
}

// Set up the response canvas to match the Hegarty Lab style
function setupResponseCanvas(standingObject, facingObject) {
    const canvas = document.getElementById('response-canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw the circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw labels for standing and facing objects
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    
    // Facing object at top (0°)
    ctx.fillText(getObjectName(facingObject), centerX, centerY - radius - 5);
    
    // Standing object at center
    ctx.fillText(getObjectName(standingObject), centerX, centerY);
    
    // Initial line at 0 degrees (straight up)
    currentAngle = 0;
    drawResponseLine(ctx, centerX, centerY, radius, currentAngle);
    
    // Make the canvas interactive
    let isDragging = false;
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateLine(e);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateLine(e);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    function updateLine(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const dx = x - centerX;
        const dy = y - centerY;
        
        // Calculate angle in degrees
        currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Convert to 0-360 range
        currentAngle = (currentAngle + 360) % 360;
        
        // Adjust so 0 is at the top (90 degrees in standard position)
        currentAngle = (currentAngle + 90) % 360;
        
        drawResponseLine(ctx, centerX, centerY, radius, currentAngle);
    }
}

// Draw the response line on the canvas
function drawResponseLine(ctx, centerX, centerY, radius, angle) {
    // Convert angle to radians (adjust for 0 at top)
    const radians = (angle - 90) * Math.PI / 180;
    
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Redraw the circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(radians) * radius,
        centerY + Math.sin(radians) * radius
    );
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Get object names
    const standingObjectName = document.querySelector('#sot-container p:nth-of-type(1)').textContent.split('standing at the ')[1].split(' and')[0];
    const facingObjectName = document.querySelector('#sot-container p:nth-of-type(1)').textContent.split('facing the ')[1].split('.')[0];
    
    // Add labels
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    
    // Facing object at top
    ctx.fillText(facingObjectName, centerX, centerY - radius - 5);
    
    // Standing object in center
    ctx.fillText(standingObjectName, centerX, centerY);
}

// Show the correct answer on the response canvas
function showCorrectAnswer(correctAngle) {
    const canvas = document.getElementById('response-canvas');
    const ctx = canvas.getContext('2d');
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
    
    // Mirror the angle across the vertical axis
    // If angle is between 0-180, map to 180-0
    // If angle is between 180-360, map to 360-180
    let mirroredAngle;
    if (correctAngle <= 180) {
        mirroredAngle = 180 - correctAngle;
    } else {
        mirroredAngle = 540 - correctAngle; // 180 + (360 - correctAngle)
    }
    
    // Convert angle to radians (and adjust for 0 at top)
    const radians = (mirroredAngle - 90) * Math.PI / 180;
    
    // Draw the red line showing correct answer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(radians) * radius,
        centerY + Math.sin(radians) * radius
    );
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Get object name by id
function getObjectName(objectId) {
    const object = objects.find(obj => obj.id === objectId);
    return object ? object.name : objectId;
}

// Finish the test
function finishTest() {
    // Clear timer
    clearInterval(testTimer);
    
    // Calculate results
    const averageResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    const averageResponseTimeRounded = Math.round(averageResponseTime * 10) / 10; // Round to 1 decimal place
    const averageAngularError = responses.reduce((sum, r) => sum + r.angularError, 0) / responses.length;
    const averageAngularErrorRounded = Math.round(averageAngularError * 10) / 10; // Round to 1 decimal place
    
    // Display completion message with score
    document.getElementById('sot-container').innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;">
            <h2>Test Completed</h2>
            <p>Thank you for completing the Spatial Orientation Test.</p>
            <div style="margin: 30px; padding: 20px; border: 2px solid #333; background: #f9f9f9;">
                <h3>Your Results</h3>
                <p><strong>Average Angular Error:</strong> ${averageAngularErrorRounded}°</p>
                <p><strong>Average Response Time:</strong> ${averageResponseTimeRounded} seconds</p>
                <p class="score-note" style="font-size: 0.9em; margin-top: 20px; color: #666;">
                    Please copy both numbers separated by a comma (example: ${averageAngularErrorRounded}, ${averageResponseTimeRounded}) 
                    and paste them in the survey question that follows.
                </p>
            </div>
            <p>Press SPACE BAR or ENTER to continue.</p>
        </div>
    `;
    
    // Add event listener for key press to continue
    function keyHandler(e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            document.removeEventListener('keydown', keyHandler);
            
            if (isInQualtrics) {
                // Send data to Qualtrics
                sendDataToQualtrics(responses);
            } else {
                // Show final message for standalone version with return instructions
                document.getElementById('sot-container').innerHTML = `
                    <div style="max-width: 800px; margin: 0 auto; text-align: center; padding: 20px;">
                        <h2>Thank You</h2>
                        <p>The test is now complete.</p>
                        <p>Please close this tab and return to the survey to continue.</p>
                        <div style="margin: 30px; padding: 20px; border: 2px solid #333; background: #f9f9f9;">
                            <h3>Your Results</h3>
                            <p><strong>Average Angular Error:</strong> ${averageAngularErrorRounded}°</p>
                            <p><strong>Average Response Time:</strong> ${averageResponseTimeRounded} seconds</p>
                            <p class="score-note" style="font-size: 0.9em; margin-top: 20px; color: #666;">
                                Remember to enter both numbers separated by a comma (${averageAngularErrorRounded}, ${averageResponseTimeRounded}) in the survey.
                            </p>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Listen for space bar or enter key
    document.addEventListener('keydown', keyHandler);
}

// Send data to Qualtrics
function sendDataToQualtrics(data) {
    if (!window.parent || !window.parent.Qualtrics) {
        console.warn('Not in a Qualtrics environment, data will not be sent.');
        return;
    }
    
    try {
        const qualtrics = window.parent.Qualtrics;
        
        // Calculate summary statistics
        const responseTimeSum = data.reduce((sum, trial) => sum + trial.responseTime, 0);
        const averageResponseTime = responseTimeSum / data.length;
        
        // Create embedded data fields in Qualtrics
        qualtrics.SurveyEngine.setEmbeddedData('SOT_AverageResponseTime', averageResponseTime.toFixed(2));
        qualtrics.SurveyEngine.setEmbeddedData('SOT_TotalTrials', data.length);
        qualtrics.SurveyEngine.setEmbeddedData('SOT_RawData', JSON.stringify(data));
        
        // Notify Qualtrics to proceed
        notifyQualtricsOfCompletion();
        
        console.log('Data successfully sent to Qualtrics');
    } catch (e) {
        console.error('Error sending data to Qualtrics:', e);
    }
}

// Notify Qualtrics that the test is complete
function notifyQualtricsOfCompletion() {
    if (window.parent) {
        try {
            // Post message to parent window
            window.parent.postMessage({
                type: 'SOT_complete'
            }, '*');
            
            console.log('Completion notification sent to Qualtrics');
        } catch (e) {
            console.error('Error notifying Qualtrics of completion:', e);
        }
    }
}
