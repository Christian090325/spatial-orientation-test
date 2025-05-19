/**
 * Spatial Orientation Test Implementation using jsPsych
 * This test measures participants' ability to estimate angular relationships between objects in space
 */

// Define the stimuli
const stimuli = [
    {
        id: 1,
        imagePath: "assets/test-stimuli/stimulus1.svg",
        targetObjects: ["tree", "car"],
        correctAngle: 45
    },
    {
        id: 2,
        imagePath: "assets/test-stimuli/stimulus2.svg",
        targetObjects: ["house", "bicycle"],
        correctAngle: 120
    },
    {
        id: 3,
        imagePath: "assets/test-stimuli/stimulus3.svg",
        targetObjects: ["bench", "fountain"],
        correctAngle: 90
    },
    {
        id: 4,
        imagePath: "assets/test-stimuli/stimulus4.svg",
        targetObjects: ["tree", "flag"],
        correctAngle: 150
    },
    {
        id: 5,
        imagePath: "assets/test-stimuli/stimulus5.svg",
        targetObjects: ["house", "park"],
        correctAngle: 75
    }
];

// Preload function for test assets
function preloadAssets() {
    const images = [
        "assets/instructions.svg",
        "assets/example.svg",
        ...stimuli.map(stim => stim.imagePath)
    ];
    
    return {
        type: jsPsychPreload,
        images: images,
        message: 'Loading test materials...',
        show_progress_bar: true,
        max_load_time: 30000
    };
}

// Test instructions
function createInstructions() {
    return {
        type: jsPsychInstructions,
        pages: [
            `<div class="instructions-container">
                <h2>Spatial Orientation Test</h2>
                <p class="instructions-text">This test measures your ability to imagine different perspectives or orientations in space.</p>
                <p class="instructions-text">You will see various scenes with objects. For each scene, you will be asked to determine the angle between certain objects.</p>
                <img src="assets/instructions.svg" alt="Test instructions diagram">
            </div>`,
            
            `<div class="instructions-container">
                <h2>Example</h2>
                <p class="instructions-text">In this example, you need to determine the angle between the House and the Tree from your perspective:</p>
                <img src="assets/example.svg" alt="Example test">
                <p class="instructions-text">You would use the dial to indicate your answer. The angle is measured clockwise from the 12 o'clock position.</p>
            </div>`,
            
            `<div class="instructions-container">
                <h2>Instructions</h2>
                <ul class="instructions-text">
                    <li>For each scene, carefully observe the objects and their relative positions.</li>
                    <li>Use the dial to indicate the angle between the specified objects.</li>
                    <li>Work as quickly as you can while still being accurate.</li>
                    <li>There are ${stimuli.length} scenes in total.</li>
                </ul>
                <p class="instructions-text">Click "Start Test" when you're ready to begin.</p>
            </div>`
        ],
        show_clickable_nav: true,
        button_label_previous: 'Previous',
        button_label_next: 'Next',
        button_label_finish: 'Start Test'
    };
}

// Create an angle response trial
function createAngleResponseTrial(stimulus) {
    return {
        type: jsPsychCanvasKeyboardResponse,
        stimulus: function(c) {
            // Clear canvas
            c.getContext('2d').clearRect(0, 0, c.width, c.height);
            
            // Create a canvas element for the stimulus image
            const img = new Image();
            img.src = stimulus.imagePath;
            
            // Wait for the image to load
            img.onload = function() {
                // Draw the image in the top portion of the canvas
                const ctx = c.getContext('2d');
                const imgWidth = Math.min(img.width, c.width * 0.8);
                const imgHeight = img.height * (imgWidth / img.width);
                
                const imgX = (c.width - imgWidth) / 2;
                const imgY = 20;
                
                ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
                
                // Add instructions text
                ctx.font = '18px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(`Indicate the angle between the ${stimulus.targetObjects[0]} and the ${stimulus.targetObjects[1]}`, 
                           c.width/2, imgY + imgHeight + 30);
                
                // Draw the angle dial
                const dialRadius = 100;
                const dialCenterX = c.width / 2;
                const dialCenterY = imgY + imgHeight + 120 + dialRadius;
                
                // Draw the dial circle
                ctx.beginPath();
                ctx.arc(dialCenterX, dialCenterY, dialRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#6c757d';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw tick marks
                for (let i = 0; i < 12; i++) {
                    const angle = (i * 30) * (Math.PI / 180);
                    const innerRadius = i % 3 === 0 ? dialRadius - 15 : dialRadius - 10;
                    
                    const startX = dialCenterX + innerRadius * Math.sin(angle);
                    const startY = dialCenterY - innerRadius * Math.cos(angle);
                    
                    const endX = dialCenterX + dialRadius * Math.sin(angle);
                    const endY = dialCenterY - dialRadius * Math.cos(angle);
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = '#6c757d';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Add labels for cardinal directions
                    if (i % 3 === 0) {
                        ctx.font = '14px Arial';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        const labelRadius = dialRadius + 20;
                        const labelX = dialCenterX + labelRadius * Math.sin(angle);
                        const labelY = dialCenterY - labelRadius * Math.cos(angle);
                        
                        let label;
                        switch(i) {
                            case 0: label = '0°'; break;
                            case 3: label = '90°'; break;
                            case 6: label = '180°'; break;
                            case 9: label = '270°'; break;
                        }
                        
                        ctx.fillText(label, labelX, labelY);
                    }
                }
                
                // Draw the initial pointer at 0 degrees
                drawPointer(ctx, dialCenterX, dialCenterY, dialRadius, 0);
                
                // Add instructions for controls
                ctx.font = '16px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('Use the left and right arrow keys to adjust the angle.', dialCenterX, dialCenterY + dialRadius + 40);
                ctx.fillText('Press Enter when your answer is complete.', dialCenterX, dialCenterY + dialRadius + 70);
            };
            
            // Store canvas globally for key response handling
            responseCanvas = c;
            currentAngle = 0;
        },
        canvas_size: [800, 600],
        choices: ['ArrowLeft', 'ArrowRight', 'Enter'],
        prompt: `<div class="mt-3">
            <p>Use left and right arrow keys to adjust the angle. Press Enter to submit.</p>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${(stimulus.id / stimuli.length) * 100}%"></div>
            </div>
            <p>Question ${stimulus.id} of ${stimuli.length}</p>
        </div>`,
        on_load: function() {
            currentAngle = 0;
        },
        on_key_press: function(data) {
            if (data.key === 'ArrowLeft') {
                currentAngle = (currentAngle - 5) % 360;
                if (currentAngle < 0) currentAngle += 360;
                redrawPointer();
            } else if (data.key === 'ArrowRight') {
                currentAngle = (currentAngle + 5) % 360;
                redrawPointer();
            }
        },
        on_finish: function(data) {
            // Calculate error (absolute difference between response and correct angle)
            const responseAngle = currentAngle;
            const correctAngle = stimulus.correctAngle;
            
            // Calculate the smallest angle between the response and correct angle
            let angleDiff = Math.abs(responseAngle - correctAngle);
            if (angleDiff > 180) {
                angleDiff = 360 - angleDiff;
            }
            
            // Store the response data
            data.response_angle = responseAngle;
            data.correct_angle = correctAngle;
            data.angle_error = angleDiff;
            data.stimulus_id = stimulus.id;
            data.rt_seconds = data.rt / 1000;
            
            // Add target objects for reference
            data.target_object1 = stimulus.targetObjects[0];
            data.target_object2 = stimulus.targetObjects[1];
        }
    };
}

// Helper function to draw the pointer at a specific angle
function drawPointer(ctx, centerX, centerY, radius, angle) {
    // Convert angle from degrees to radians
    const radians = (angle - 90) * (Math.PI / 180);
    
    // Calculate end point of the pointer
    const endX = centerX + radius * Math.cos(radians);
    const endY = centerY + radius * Math.sin(radians);
    
    // Draw the pointer line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#dc3545'; // Bootstrap danger color
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Draw a small circle at the center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#dc3545';
    ctx.fill();
    
    // Display the current angle
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`Current angle: ${angle}°`, centerX, centerY + radius + 100);
}

// Global variables for angle response interface
let responseCanvas;
let currentAngle = 0;

// Function to redraw the pointer when the angle changes
function redrawPointer() {
    if (!responseCanvas) return;
    
    const c = responseCanvas;
    const ctx = c.getContext('2d');
    
    // Get the center and radius of the dial
    const width = c.width;
    const height = c.height;
    
    // Assuming the dial is positioned based on the stimulus image above it
    // These values should match the ones in the createAngleResponseTrial function
    const imgHeight = height * 0.4; // Rough estimation of the image height
    const dialRadius = 100;
    const dialCenterX = width / 2;
    const dialCenterY = 20 + imgHeight + 120 + dialRadius;
    
    // Clear only the dial area
    ctx.clearRect(
        dialCenterX - dialRadius - 20, 
        dialCenterY - dialRadius - 20,
        dialRadius * 2 + 40, 
        dialRadius * 2 + 130
    );
    
    // Redraw the dial circle
    ctx.beginPath();
    ctx.arc(dialCenterX, dialCenterY, dialRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Redraw tick marks
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * (Math.PI / 180);
        const innerRadius = i % 3 === 0 ? dialRadius - 15 : dialRadius - 10;
        
        const startX = dialCenterX + innerRadius * Math.sin(angle);
        const startY = dialCenterY - innerRadius * Math.cos(angle);
        
        const endX = dialCenterX + dialRadius * Math.sin(angle);
        const endY = dialCenterY - dialRadius * Math.cos(angle);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add labels for cardinal directions
        if (i % 3 === 0) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const labelRadius = dialRadius + 20;
            const labelX = dialCenterX + labelRadius * Math.sin(angle);
            const labelY = dialCenterY - labelRadius * Math.cos(angle);
            
            let label;
            switch(i) {
                case 0: label = '0°'; break;
                case 3: label = '90°'; break;
                case 6: label = '180°'; break;
                case 9: label = '270°'; break;
            }
            
            ctx.fillText(label, labelX, labelY);
        }
    }
    
    // Draw the pointer at the current angle
    drawPointer(ctx, dialCenterX, dialCenterY, dialRadius, currentAngle);
    
    // Redraw instructions
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Use the left and right arrow keys to adjust the angle.', dialCenterX, dialCenterY + dialRadius + 40);
    ctx.fillText('Press Enter when your answer is complete.', dialCenterX, dialCenterY + dialRadius + 70);
}

// Create the completion page
function createCompletionPage() {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            // Calculate performance metrics
            const trials = jsPsych.data.get().filter({trial_type: 'canvas-keyboard-response'});
            
            if (trials.count() === 0) {
                return "<h2>Test Completed</h2><p>Thank you for participating.</p>";
            }
            
            const totalErrors = trials.select('angle_error').sum();
            const averageError = Math.round(totalErrors / trials.count());
            const averageTime = Math.round(trials.select('rt_seconds').mean() * 10) / 10;
            
            return `
                <div class="container">
                    <h2 class="text-center mb-4">Test Completed</h2>
                    <p>Thank you for completing the Spatial Orientation Test.</p>
                    <div class="card mb-4">
                        <div class="card-header">Your Results</div>
                        <div class="card-body">
                            <p>Average angular error: ${averageError}°</p>
                            <p>Average response time: ${averageTime} seconds</p>
                        </div>
                    </div>
                    <p>Your responses have been recorded. You may now close this window or proceed back to the survey.</p>
                </div>
            `;
        },
        choices: ['Return to Survey'],
        on_finish: function(data) {
            // Compile all the test data
            const testData = jsPsych.data.get().filter({trial_type: 'canvas-keyboard-response'}).json();
            
            // Send data back to Qualtrics if in Qualtrics environment
            if (window.parent && window.parent.Qualtrics) {
                sendDataToQualtrics(testData);
            }
        }
    };
}

// Initialize the Spatial Orientation Test
function initSpatialOrientationTest(isInQualtrics = false) {
    // Initialize jsPsych
    const jsPsych = initJsPsych({
        on_finish: function() {
            if (isInQualtrics) {
                // Collect and send data to Qualtrics if in Qualtrics environment
                const testData = jsPsych.data.get().filter({trial_type: 'canvas-keyboard-response'}).json();
                sendDataToQualtrics(testData);
                notifyQualtricsOfCompletion(testData);
            }
        }
    });
    
    // Create the jsPsych timeline
    const timeline = [];
    
    // Add preload trials
    timeline.push(preloadAssets());
    
    // Add instructions
    timeline.push(createInstructions());
    
    // Add the test trials
    stimuli.forEach(stimulus => {
        timeline.push(createAngleResponseTrial(stimulus));
    });
    
    // Add the completion page
    timeline.push(createCompletionPage());
    
    // Run the experiment
    jsPsych.run(timeline);
}
