# Deployment Guide: Spatial Orientation Test

This guide will help you deploy the Spatial Orientation Test to GitHub Pages and embed it in Qualtrics.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in or create an account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "spatial-orientation-test")
4. Make it public (required for free GitHub Pages)
5. Click "Create repository"

## Step 2: Upload Files to GitHub

Option 1: Use GitHub's web interface
1. In your new repository, click "Add file" → "Upload files"
2. Drag and drop all files and folders from this directory
3. Commit the changes

Option 2: Use Git (if you're familiar with it)
1. Clone the repository
2. Copy the files into the cloned repository
3. Commit and push the changes

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (tab at the top)
3. Scroll down to the "GitHub Pages" section
4. For "Source", select "main" branch (or "master" if that's your default)
5. Click "Save"
6. GitHub will provide a URL like: https://yourusername.github.io/repository-name/

It may take a few minutes for your site to become available.

## Step 4: Embed in Qualtrics

1. In your Qualtrics survey, add a new question
2. Change the question type to "JavaScript"
3. Click on the "JavaScript" editor
4. Paste the following code, replacing YOUR_GITHUB_PAGES_URL with your actual GitHub Pages URL:

```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    // Create an iframe to embed the test
    var iframe = document.createElement('iframe');
    iframe.src = 'YOUR_GITHUB_PAGES_URL'; // Replace with your GitHub Pages URL
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
        if (event.origin !== 'YOUR_GITHUB_DOMAIN') { // e.g., https://yourusername.github.io
            return;
        }
        
        // Check if this is the completion message
        if (event.data && event.data.type === 'SOT_complete') {
            // Show the Next button again
            this.showNextButton();
        }
    }.bind(this), false);
});
```

## Step 5: Set Up Embedded Data Fields in Qualtrics

1. In your Qualtrics survey, go to "Survey Flow"
2. Click "Add a New Element Here" and select "Embedded Data"
3. Add the following embedded data fields:
   - SOT_AverageError
   - SOT_AverageRT
   - SOT_AccuracyScore
   - SOT_RawData
4. Place this embedded data element before your JavaScript question in the survey flow

## Testing Your Integration

1. Preview your Qualtrics survey
2. When you reach the Spatial Orientation Test question, it should display in the iframe
3. Complete the test
4. The test should automatically advance the survey
5. Check your embedded data fields to ensure they're receiving the test data

## Troubleshooting

If the test doesn't appear:
- Check that your GitHub Pages site is published correctly
- Ensure your iframe URL is correct
- Check browser console for errors

If the test doesn't send data to Qualtrics:
- Verify that both domains are using HTTPS
- Check that the origin verification in the message listener matches your GitHub Pages domain
- Look for errors in the browser console