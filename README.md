# 🏀 Basketball Shot Form Analyzer

## Computer Vision Application for Youth Athlete Development

A real-time basketball shooting form analyzer that uses AI-powered pose detection to evaluate shooting technique and provide instant feedback.
- Track technique improvement over time
- Provide objective data to coaches and scouts
- Help athletes from pee wee through college levels
- Identify areas for focused training
- Support recruitment with quantifiable metrics


---

## 🎯 Project Overview

This application leverages **MediaPipe Pose Detection** to analyze basketball shooting form in real-time through a web browser. It evaluates key biomechanical markers and provides a comprehensive form score with actionable feedback - perfect for youth athletes, coaches, and sports development programs.

### Key Features

✅ **Real-Time Pose Detection** - Uses Google's MediaPipe for accurate body tracking  
✅ **Biomechanical Analysis** - Evaluates 4 critical shooting metrics:
- Shooting elbow angle (optimal: 85-95°)
- Release height angle (optimal: 45-60°)
- Knee bend angle (optimal: 100-130°)
- Body alignment score (shoulder level)

✅ **Overall Form Score** - Composite 0-100 rating with visual feedback  
✅ **Live Visual Overlay** - Skeleton tracking with angle indicators  
✅ **Interactive Dashboard** - Real-time metrics with color-coded progress bars  
✅ **Professional UI** - Clean, responsive design that works on desktop and mobile  

---

## 🚀 Live Demo

**Deployed URL:** [Your Netlify URL will go here]

---

## 💻 Technology Stack

- **HTML5** - Structure and canvas rendering
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Core application logic
- **MediaPipe Pose** - ML-powered pose detection (Google)
- **Canvas API** - Real-time video overlay and visualization
- **WebRTC** - Webcam access

---


## 🎨 How It Works

1. **Initialization**: App loads MediaPipe Pose model from CDN
2. **Camera Access**: Requests webcam permissions when user clicks "Start Analysis"
3. **Pose Detection**: MediaPipe processes each video frame (30 FPS) and returns 33 body landmarks
4. **Analysis**: App calculates angles between key joints (shoulder-elbow-wrist, etc.)
5. **Scoring**: Each metric is scored 0-100 based on optimal ranges
6. **Feedback**: Real-time visual overlay + dashboard updates with scores and tips
7. **Averaging**: Rolling 30-frame average smooths out measurements

### Biomechanical Metrics Explained

**Shooting Elbow (30% of score)**
- Measures the angle at the elbow joint during release
- Optimal: 85-95° (straight arm position)
- Why it matters: Proper elbow angle ensures consistent release and follow-through

**Release Height (30% of score)**
- Measures the angle from shoulder to wrist relative to horizontal
- Optimal: 45-60° (high release point)
- Why it matters: Higher release = harder to block, better arc

**Knee Bend (20% of score)**
- Measures the angle at the knee joint
- Optimal: 100-130° (athletic stance with power position)
- Why it matters: Leg power is critical for range and consistency

**Body Alignment (20% of score)**
- Measures shoulder levelness
- Optimal: Shoulders level (score near 100)
- Why it matters: Balanced form leads to accurate shots

---

## 📁 Project Structure

```
basketball-shot-analyzer/
│
├── index.html          # Main HTML structure
├── styles.css          # Complete styling (responsive design)
├── app.js              # Core application logic
└── README.md           # This file
```

## 🔧 Technical Details

### MediaPipe Configuration
```javascript
modelComplexity: 1           // Balance accuracy/speed
smoothLandmarks: true        // Smooth tracking between frames
minDetectionConfidence: 0.5  // Detection threshold
minTrackingConfidence: 0.5   // Tracking threshold
```
---

## 📱 Usage Instructions

1. **Grant Camera Access**: Click "Allow" when prompted
2. **Position Yourself**: Stand 6-8 feet from camera, full body visible
3. **Start Analysis**: Click "Start Analysis" button
4. **Perform Shooting Motion**: Go through your shooting form slowly
5. **Review Metrics**: Check real-time scores and feedback
6. **Adjust Form**: Follow the tips to improve your technique
7. **Reset Stats**: Click "Reset Stats" to clear and start over

---

## 🎯 Future Enhancements

Potential features for integration with athlete tracking platform:
- Recording and playback of analysis sessions
- Historical data tracking over weeks/months
- Comparison with professional form
- Multi-player comparison mode
- Export reports for coaches
- Mobile app version
- Additional sports (baseball, football, etc.)

---

## 📄 License

This project is created for educational purposes as part of a computer vision course assignment.

---

## 🙏 Acknowledgments

- Google MediaPipe team for the excellent pose detection model
- Basketball coaching resources for biomechanical insights
- Youth sports development programs for inspiration

---

**Ready to analyze your shot? Deploy and start improving your form today!** 🏀✨
