/**
 * Basketball Shot Form Analyzer
 * Uses MediaPipe Pose Detection for real-time biomechanical analysis
 * Evaluates shooting form based on key angles and body positioning
 */

// DOM Elements
const video = document.getElementById('webcam');
const canvas = document.getElementById('output-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const statusText = document.getElementById('status-text');

// MediaPipe Pose instance
let pose;
let camera;
let isRunning = false;

// Analysis data
let frameCount = 0;
let analysisData = {
    elbowAngles: [],
    releaseHeights: [],
    kneeAngles: [],
    alignmentScores: []
};

/**
 * Initialize MediaPipe Pose
 * Sets up the pose detection model with optimal configuration
 */
async function initializePose() {
    try {
        statusText.textContent = 'Loading AI Model...';
        
        pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        // Configure pose detection settings
        pose.setOptions({
            modelComplexity: 1,        // Balance between accuracy and speed
            smoothLandmarks: true,      // Smooth tracking between frames
            enableSegmentation: false,  // We don't need background segmentation
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        // Set up results callback
        pose.onResults(onPoseResults);

        statusText.textContent = 'Ready';
        loadingOverlay.classList.add('hidden');
        
    } catch (error) {
        console.error('Error initializing pose:', error);
        statusText.textContent = 'Error loading model';
        alert('Failed to load AI model. Please refresh the page.');
    }
}

/**
 * Start camera and pose detection
 */
async function startCamera() {
    try {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        isRunning = true;
        statusText.textContent = 'Analyzing...';

        // Initialize camera
        camera = new Camera(video, {
            onFrame: async () => {
                if (isRunning) {
                    await pose.send({ image: video });
                }
            },
            width: 1280,
            height: 720
        });

        await camera.start();
        
    } catch (error) {
        console.error('Error starting camera:', error);
        alert('Could not access camera. Please grant camera permissions and try again.');
        resetCamera();
    }
}

/**
 * Stop camera and pose detection
 */
function stopCamera() {
    isRunning = false;
    
    if (camera) {
        camera.stop();
    }
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = 'Stopped';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Reset all statistics and analysis data
 */
function resetStats() {
    analysisData = {
        elbowAngles: [],
        releaseHeights: [],
        kneeAngles: [],
        alignmentScores: []
    };
    frameCount = 0;
    
    // Reset UI displays
    updateMetricDisplay('overall-score', '--');
    updateMetricDisplay('elbow-angle', '--°');
    updateMetricDisplay('release-height', '--°');
    updateMetricDisplay('knee-angle', '--°');
    updateMetricDisplay('alignment-score', '--');
    
    document.getElementById('form-feedback').textContent = 'Statistics reset. Continue analyzing...';
    updateProgressBars(0, 0, 0, 0);
    updateScoreRing(0);
}

/**
 * Process pose detection results
 * This is the main analysis function called for each video frame
 */
function onPoseResults(results) {
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Check if pose is detected
    if (!results.poseLandmarks) {
        document.getElementById('form-feedback').textContent = 'No person detected. Step into frame.';
        return;
    }

    // Draw pose landmarks and connections
    drawPose(results.poseLandmarks);

    // Perform biomechanical analysis
    analyzeShootingForm(results.poseLandmarks);
    
    frameCount++;
}

/**
 * Draw pose skeleton and landmarks on canvas
 */
function drawPose(landmarks) {
    // Draw connections between landmarks
    const connections = [
        [11, 13], [13, 15], // Right arm
        [12, 14], [14, 16], // Left arm
        [11, 12],           // Shoulders
        [11, 23], [12, 24], // Torso
        [23, 24],           // Hips
        [23, 25], [25, 27], // Right leg
        [24, 26], [26, 28]  // Left leg
    ];

    // Draw connections
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    
    connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        
        if (startPoint && endPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
            ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
            ctx.stroke();
        }
    });

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
        // Only draw major landmarks
        if (index > 10 && index < 29) {
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                6,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    });
}

/**
 * Analyze shooting form based on pose landmarks
 * Evaluates elbow angle, release height, knee bend, and body alignment
 */
function analyzeShootingForm(landmarks) {
    // Get key landmarks (using right side for shooting arm)
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];
    const leftShoulder = landmarks[11];

    // Calculate shooting elbow angle
    const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    // Calculate release height (angle from horizontal)
    const releaseHeight = calculateReleaseAngle(rightShoulder, rightWrist);
    
    // Calculate knee bend angle
    const kneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    // Calculate body alignment (shoulder level)
    const alignmentScore = calculateAlignment(leftShoulder, rightShoulder);

    // Store data for averaging
    analysisData.elbowAngles.push(elbowAngle);
    analysisData.releaseHeights.push(releaseHeight);
    analysisData.kneeAngles.push(kneeAngle);
    analysisData.alignmentScores.push(alignmentScore);

    // Keep only last 30 frames for rolling average
    if (analysisData.elbowAngles.length > 30) {
        analysisData.elbowAngles.shift();
        analysisData.releaseHeights.shift();
        analysisData.kneeAngles.shift();
        analysisData.alignmentScores.shift();
    }

    // Calculate averages
    const avgElbow = average(analysisData.elbowAngles);
    const avgRelease = average(analysisData.releaseHeights);
    const avgKnee = average(analysisData.kneeAngles);
    const avgAlignment = average(analysisData.alignmentScores);

    // Update UI with current measurements
    updateMetricDisplay('elbow-angle', Math.round(avgElbow) + '°');
    updateMetricDisplay('release-height', Math.round(avgRelease) + '°');
    updateMetricDisplay('knee-angle', Math.round(avgKnee) + '°');
    updateMetricDisplay('alignment-score', Math.round(avgAlignment));

    // Calculate individual scores (0-100)
    const elbowScore = scoreElbowAngle(avgElbow);
    const releaseScore = scoreReleaseHeight(avgRelease);
    const kneeScore = scoreKneeAngle(avgKnee);
    const alignmentScoreValue = avgAlignment;

    // Calculate overall form score
    const overallScore = Math.round(
        (elbowScore * 0.3) + 
        (releaseScore * 0.3) + 
        (kneeScore * 0.2) + 
        (alignmentScoreValue * 0.2)
    );

    // Update UI elements
    updateMetricDisplay('overall-score', overallScore);
    updateScoreRing(overallScore);
    updateProgressBars(elbowScore, releaseScore, kneeScore, alignmentScoreValue);
    updateFeedback(overallScore, elbowScore, releaseScore, kneeScore, alignmentScoreValue);
    updateStatusMessages(avgElbow, avgRelease, avgKnee, avgAlignment);

    // Draw angle indicators on canvas
    drawAngleIndicator(rightShoulder, rightElbow, rightWrist, avgElbow);
}

/**
 * Calculate angle between three points
 * Returns angle in degrees
 */
function calculateAngle(point1, point2, point3) {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                    Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    
    return angle;
}

/**
 * Calculate release angle from horizontal
 */
function calculateReleaseAngle(shoulder, wrist) {
    const deltaY = shoulder.y - wrist.y;
    const deltaX = Math.abs(shoulder.x - wrist.x);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    return Math.max(0, angle);
}

/**
 * Calculate body alignment score based on shoulder level
 */
function calculateAlignment(leftShoulder, rightShoulder) {
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const alignmentScore = Math.max(0, 100 - (shoulderDiff * 1000));
    return alignmentScore;
}

/**
 * Score elbow angle (optimal range: 85-95 degrees)
 */
function scoreElbowAngle(angle) {
    const optimal = 90;
    const tolerance = 10;
    const diff = Math.abs(angle - optimal);
    
    if (diff <= tolerance) {
        return 100 - (diff * 5);
    } else {
        return Math.max(0, 50 - ((diff - tolerance) * 2));
    }
}

/**
 * Score release height (optimal range: 45-60 degrees)
 */
function scoreReleaseHeight(angle) {
    if (angle >= 45 && angle <= 60) {
        return 100;
    } else if (angle < 45) {
        return Math.max(0, angle / 45 * 100);
    } else {
        return Math.max(0, 100 - ((angle - 60) * 3));
    }
}

/**
 * Score knee bend (optimal range: 100-130 degrees)
 */
function scoreKneeAngle(angle) {
    if (angle >= 100 && angle <= 130) {
        return 100;
    } else if (angle < 100) {
        return Math.max(0, angle / 100 * 100);
    } else {
        return Math.max(0, 100 - ((angle - 130) * 2));
    }
}

/**
 * Draw angle indicator on canvas
 */
function drawAngleIndicator(point1, vertex, point3, angle) {
    const x = vertex.x * canvas.width;
    const y = vertex.y * canvas.height;
    
    // Draw angle arc
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw angle text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(Math.round(angle) + '°', x + 35, y - 10);
}

/**
 * Update metric display element
 */
function updateMetricDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Update circular progress ring for overall score
 */
function updateScoreRing(score) {
    const ring = document.getElementById('score-ring');
    const circumference = 2 * Math.PI * 52; // radius = 52
    const offset = circumference - (score / 100) * circumference;
    
    ring.style.strokeDashoffset = offset;
    
    // Change color based on score
    if (score >= 80) {
        ring.style.stroke = '#4ade80';
    } else if (score >= 60) {
        ring.style.stroke = '#fbbf24';
    } else {
        ring.style.stroke = '#ef4444';
    }
}

/**
 * Update progress bars for each metric
 */
function updateProgressBars(elbowScore, releaseScore, kneeScore, alignmentScore) {
    updateBar('elbow-bar', elbowScore);
    updateBar('release-bar', releaseScore);
    updateBar('knee-bar', kneeScore);
    updateBar('alignment-bar', alignmentScore);
}

/**
 * Update individual progress bar
 */
function updateBar(barId, score) {
    const bar = document.getElementById(barId);
    bar.style.width = score + '%';
    
    // Remove existing classes
    bar.classList.remove('good', 'warning', 'poor');
    
    // Add class based on score
    if (score >= 80) {
        bar.classList.add('good');
    } else if (score >= 60) {
        bar.classList.add('warning');
    } else {
        bar.classList.add('poor');
    }
}

/**
 * Update feedback text based on overall performance
 */
function updateFeedback(overall, elbow, release, knee, alignment) {
    const feedback = document.getElementById('form-feedback');
    
    if (overall >= 85) {
        feedback.textContent = '🎯 Excellent form! Your technique is on point!';
    } else if (overall >= 70) {
        feedback.textContent = '👍 Good form! Keep practicing for consistency.';
    } else if (overall >= 50) {
        feedback.textContent = '⚠️ Fair form. Focus on the metrics highlighted below.';
    } else {
        feedback.textContent = '💡 Needs improvement. Review the technique tips.';
    }
}

/**
 * Update status messages for each metric
 */
function updateStatusMessages(elbow, release, knee, alignment) {
    // Elbow status
    const elbowStatus = document.getElementById('elbow-status');
    if (elbow >= 85 && elbow <= 95) {
        elbowStatus.textContent = '✓ Perfect elbow angle!';
        elbowStatus.style.color = '#4ade80';
    } else if (elbow < 85) {
        elbowStatus.textContent = '↑ Raise your elbow slightly';
        elbowStatus.style.color = '#f59e0b';
    } else {
        elbowStatus.textContent = '↓ Lower your elbow slightly';
        elbowStatus.style.color = '#f59e0b';
    }

    // Release status
    const releaseStatus = document.getElementById('release-status');
    if (release >= 45 && release <= 60) {
        releaseStatus.textContent = '✓ Optimal release height!';
        releaseStatus.style.color = '#4ade80';
    } else if (release < 45) {
        releaseStatus.textContent = '↑ Release point too low';
        releaseStatus.style.color = '#f59e0b';
    } else {
        releaseStatus.textContent = '↓ Release point too high';
        releaseStatus.style.color = '#f59e0b';
    }

    // Knee status
    const kneeStatus = document.getElementById('knee-status');
    if (knee >= 100 && knee <= 130) {
        kneeStatus.textContent = '✓ Good knee bend!';
        kneeStatus.style.color = '#4ade80';
    } else if (knee < 100) {
        kneeStatus.textContent = 'Bend knees more';
        kneeStatus.style.color = '#f59e0b';
    } else {
        kneeStatus.textContent = 'Knees too bent';
        kneeStatus.style.color = '#f59e0b';
    }

    // Alignment status
    const alignmentStatus = document.getElementById('alignment-status');
    if (alignment >= 90) {
        alignmentStatus.textContent = '✓ Perfect alignment!';
        alignmentStatus.style.color = '#4ade80';
    } else {
        alignmentStatus.textContent = 'Check shoulder level';
        alignmentStatus.style.color = '#f59e0b';
    }
}

/**
 * Calculate average of an array
 */
function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Reset camera state
 */
function resetCamera() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = 'Ready';
}

// Event Listeners
startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
resetBtn.addEventListener('click', resetStats);

// Initialize on page load
window.addEventListener('load', () => {
    initializePose();
});

// Handle page visibility changes (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning) {
        // Optionally pause when tab is hidden to save resources
    }
});
