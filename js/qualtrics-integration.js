/**
 * Qualtrics Integration for Spatial Orientation Test
 * This file contains functions for embedding the test in Qualtrics and
 * sending the data back to the Qualtrics survey
 */

// Function to send data back to Qualtrics
function sendDataToQualtrics(testData) {
    // Check if we're in a Qualtrics environment
    if (!window.parent || !window.parent.Qualtrics) {
        console.warn('Not in a Qualtrics environment, data will not be sent.');
        return;
    }
    
    try {
        const qualtrics = window.parent.Qualtrics;
        
        // Parse the data if it's a string
        const data = typeof testData === 'string' ? JSON.parse(testData) : testData;
        
        // Calculate summary statistics
        const averageError = calculateAverageAngularError(data);
        const averageRT = calculateAverageResponseTime(data);
        const accuracyScore = calculateAccuracyScore(data);
        
        // Create embedded data fields in Qualtrics
        qualtrics.SurveyEngine.setEmbeddedData('SOT_AverageError', averageError);
        qualtrics.SurveyEngine.setEmbeddedData('SOT_AverageRT', averageRT);
        qualtrics.SurveyEngine.setEmbeddedData('SOT_AccuracyScore', accuracyScore);
        qualtrics.SurveyEngine.setEmbeddedData('SOT_RawData', JSON.stringify(data));
        
        // Send individual trial data for each stimulus
        data.forEach((trial, index) => {
            qualtrics.SurveyEngine.setEmbeddedData(`SOT_Trial${index+1}_Error`, trial.angle_error);
            qualtrics.SurveyEngine.setEmbeddedData(`SOT_Trial${index+1}_RT`, trial.rt_seconds);
            qualtrics.SurveyEngine.setEmbeddedData(`SOT_Trial${index+1}_ResponseAngle`, trial.response_angle);
        });
        
        console.log('Data successfully sent to Qualtrics');
    } catch (e) {
        console.error('Error sending data to Qualtrics:', e);
    }
}

// Helper function to calculate average angular error
function calculateAverageAngularError(data) {
    if (!data || data.length === 0) return 0;
    
    const totalError = data.reduce((sum, trial) => sum + (trial.angle_error || 0), 0);
    return Math.round(totalError / data.length);
}

// Helper function to calculate average response time
function calculateAverageResponseTime(data) {
    if (!data || data.length === 0) return 0;
    
    const totalRT = data.reduce((sum, trial) => sum + (trial.rt_seconds || 0), 0);
    return Math.round(totalRT / data.length * 10) / 10; // Round to 1 decimal place
}

// Helper function to calculate an accuracy score (0-100)
function calculateAccuracyScore(data) {
    if (!data || data.length === 0) return 0;
    
    // Calculate error percentage (assuming 180 is max possible error)
    const maxError = 180;
    const errorPercentage = data.reduce((sum, trial) => sum + ((trial.angle_error || 0) / maxError), 0) / data.length;
    
    // Convert to accuracy score (0-100)
    const accuracyScore = Math.round((1 - errorPercentage) * 100);
    
    return Math.max(0, Math.min(100, accuracyScore)); // Ensure it's between 0-100
}

// Function to embed the test in a Qualtrics survey
function embedInQualtrics() {
    // This function is called by Qualtrics when setting up the integration
    
    // 1. Create a Qualtrics question with a JavaScript type
    // 2. Paste the following code into the question's JavaScript editor:
    
    /*
    Qualtrics.SurveyEngine.addOnload(function() {
        // Create an iframe to embed the test
        var iframe = document.createElement('iframe');
        iframe.src = 'https://yourusername.github.io/spatial-orientation-test/'; // Replace with your GitHub Pages URL
        iframe.style.width = '100%';
        iframe.style.height = '700px';
        iframe.style.border = 'none';
        
        // Get the question container
        var container = this.getQuestionContainer();
        
        // Clear existing content and add the iframe
        container.querySelector('.QuestionText').innerHTML = '';
        container.querySelector('.QuestionText').appendChild(iframe);
        
        // Hide the Next button until the test is completed
        this.hideNextButton();
        
        // Create a message listener to receive data from the iframe
        window.addEventListener('message', function(event) {
            // Verify the origin for security
            if (event.origin !== 'https://yourusername.github.io') {
                return;
            }
            
            // Check if this is the completion message
            if (event.data && event.data.type === 'SOT_complete') {
                // Show the Next button again
                this.showNextButton();
            }
        }.bind(this), false);
    });
    */
}

// Function to post message to parent Qualtrics window when test is complete
function notifyQualtricsOfCompletion(data) {
    if (window.parent) {
        try {
            // Post message to parent window
            window.parent.postMessage({
                type: 'SOT_complete',
                data: data
            }, '*');
            
            console.log('Completion notification sent to Qualtrics');
        } catch (e) {
            console.error('Error notifying Qualtrics of completion:', e);
        }
    }
}

// Instructions for embedding the test in Qualtrics
console.log(`
To embed this Spatial Orientation Test in a Qualtrics survey:

1. Host this code on GitHub Pages
2. In Qualtrics, add a new question with the "JavaScript" question type
3. In the JavaScript editor, paste the code from the embedInQualtrics() function
4. Update the iframe src URL to point to your GitHub Pages URL
5. Set up Embedded Data fields in your survey to receive the test results
`);
