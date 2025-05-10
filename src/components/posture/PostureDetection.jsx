import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const PostureDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [exerciseType, setExerciseType] = useState('squat');
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  
  // Load TensorFlow model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet, 
          detectorConfig
        );
        setModel(detector);
        setLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setFeedback('Error loading posture detection model. Please try again later.');
        setLoading(false);
      }
    };
    
    loadModel();
    
    // Check for camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setCameraPermission(true))
      .catch(() => setCameraPermission(false));
      
    return () => {
      // Cleanup
      if (model) {
        // No specific cleanup needed for MoveNet model
      }
    };
  }, []);
  
  // Detect poses in real-time
  const detectPose = async () => {
    if (!model || !webcamRef.current || !canvasRef.current) return;
    
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const detectFrame = async () => {
      if (!isDetecting) return;
      
      try {
        // Detect pose
        const poses = await model.estimatePoses(video);
        
        if (poses.length > 0) {
          const pose = poses[0];
          
          // Draw pose
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame first
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Draw keypoints
          pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.5) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
          });
          
          // Draw skeleton
          drawSkeleton(pose.keypoints, ctx);
          
          // Analyze posture based on exercise type
          analyzePosture(pose.keypoints);
        }
      } catch (error) {
        console.error('Error detecting pose:', error);
      }
      
      // Continue detection loop
      if (isDetecting) {
        requestAnimationFrame(detectFrame);
      }
    };
    
    detectFrame();
  };
  
  // Draw skeleton connecting keypoints
  const drawSkeleton = (keypoints, ctx) => {
    // Define connections between keypoints
    const connections = [
      ['nose', 'left_eye'], ['nose', 'right_eye'],
      ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
      ['nose', 'left_shoulder'], ['nose', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
    ];
    
    // Create a map of keypoint name to keypoint
    const keypointMap = {};
    keypoints.forEach(keypoint => {
      keypointMap[keypoint.name] = keypoint;
    });
    
    // Draw connections
    ctx.strokeStyle = 'aqua';
    ctx.lineWidth = 2;
    
    connections.forEach(([start, end]) => {
      const startPoint = keypointMap[start];
      const endPoint = keypointMap[end];
      
      if (startPoint && endPoint && startPoint.score > 0.5 && endPoint.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });
  };
  
  // Analyze posture based on exercise type
  const analyzePosture = (keypoints) => {
    const keypointMap = {};
    keypoints.forEach(keypoint => {
      keypointMap[keypoint.name] = keypoint;
    });
    
    switch (exerciseType) {
      case 'squat':
        analyzeSquat(keypointMap);
        break;
      case 'pushup':
        analyzePushup(keypointMap);
        break;
      case 'plank':
        analyzePlank(keypointMap);
        break;
      default:
        setFeedback('Select an exercise type for posture feedback');
    }
  };
  
  // Analyze squat form
  const analyzeSquat = (keypointMap) => {
    const leftHip = keypointMap.left_hip;
    const leftKnee = keypointMap.left_knee;
    const leftAnkle = keypointMap.left_ankle;
    const rightHip = keypointMap.right_hip;
    const rightKnee = keypointMap.right_knee;
    const rightAnkle = keypointMap.right_ankle;
    
    if (leftHip && leftKnee && leftAnkle && rightHip && rightKnee && rightAnkle) {
      // Calculate knee angle
      const leftKneeAngle = calculateAngle(
        [leftHip.x, leftHip.y],
        [leftKnee.x, leftKnee.y],
        [leftAnkle.x, leftAnkle.y]
      );
      
      const rightKneeAngle = calculateAngle(
        [rightHip.x, rightHip.y],
        [rightKnee.x, rightKnee.y],
        [rightAnkle.x, rightAnkle.y]
      );
      
      const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
      
      // Provide feedback based on knee angle
      if (avgKneeAngle < 90) {
        setFeedback('Good squat depth! Keep your chest up.');
      } else if (avgKneeAngle < 120) {
        setFeedback('Try to go a bit deeper in your squat.');
      } else {
        setFeedback('Bend your knees more to achieve proper squat depth.');
      }
    } else {
      setFeedback('Position your full body in the camera view.');
    }
  };
  
  // Analyze pushup form
  const analyzePushup = (keypointMap) => {
    const leftShoulder = keypointMap.left_shoulder;
    const leftElbow = keypointMap.left_elbow;
    const leftWrist = keypointMap.left_wrist;
    const rightShoulder = keypointMap.right_shoulder;
    const rightElbow = keypointMap.right_elbow;
    const rightWrist = keypointMap.right_wrist;
    
    if (leftShoulder && leftElbow && leftWrist && rightShoulder && rightElbow && rightWrist) {
      // Calculate elbow angle
      const leftElbowAngle = calculateAngle(
        [leftShoulder.x, leftShoulder.y],
        [leftElbow.x, leftElbow.y],
        [leftWrist.x, leftWrist.y]
      );
      
      const rightElbowAngle = calculateAngle(
        [rightShoulder.x, rightShoulder.y],
        [rightElbow.x, rightElbow.y],
        [rightWrist.x, rightWrist.y]
      );
      
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
      
      // Provide feedback based on elbow angle
      if (avgElbowAngle < 90) {
        setFeedback('Good pushup depth! Keep your core tight.');
      } else if (avgElbowAngle < 120) {
        setFeedback('Try to go a bit lower in your pushup.');
      } else {
        setFeedback('Bend your elbows more to achieve proper pushup depth.');
      }
    } else {
      setFeedback('Position your upper body in the camera view.');
    }
  };
  
  // Analyze plank form
  const analyzePlank = (keypointMap) => {
    const leftShoulder = keypointMap.left_shoulder;
    const leftHip = keypointMap.left_hip;
    const leftAnkle = keypointMap.left_ankle;
    const rightShoulder = keypointMap.right_shoulder;
    const rightHip = keypointMap.right_hip;
    const rightAnkle = keypointMap.right_ankle;
    
    if (leftShoulder && leftHip && leftAnkle && rightShoulder && rightHip && rightAnkle) {
      // Calculate body alignment
      const leftBodyAngle = calculateAngle(
        [leftShoulder.x, leftShoulder.y],
        [leftHip.x, leftHip.y],
        [leftAnkle.x, leftAnkle.y]
      );
      
      const rightBodyAngle = calculateAngle(
        [rightShoulder.x, rightShoulder.y],
        [rightHip.x, rightHip.y],
        [rightAnkle.x, rightAnkle.y]
      );
      
      const avgBodyAngle = (leftBodyAngle + rightBodyAngle) / 2;
      
      // Provide feedback based on body alignment
      if (avgBodyAngle > 160) {
        setFeedback('Great plank form! Keep your body straight.');
      } else if (avgBodyAngle > 140) {
        setFeedback('Try to keep your hips a bit higher to maintain a straight line.');
      } else {
        setFeedback('Lift your hips to align your body in a straight line.');
      }
    } else {
      setFeedback('Position your full body in the camera view.');
    }
  };
  
  // Calculate angle between three points
  const calculateAngle = (p1, p2, p3) => {
    const radians = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]) - 
                    Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    
    return angle;
  };
  
  // Toggle pose detection
  const toggleDetection = () => {
    if (!isDetecting) {
      setIsDetecting(true);
      detectPose();
    } else {
      setIsDetecting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 to-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Real-time Posture Detection</h1>
        
        <div className="mb-6">
          <p className="mb-4">
            Use your camera to analyze your exercise form in real-time. Select an exercise type below:
          </p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setExerciseType('squat')}
              className={`px-4 py-2 rounded-md ${
                exerciseType === 'squat' ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              Squat
            </button>
            <button
              onClick={() => setExerciseType('pushup')}
              className={`px-4 py-2 rounded-md ${
                exerciseType === 'pushup' ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              Push-up
            </button>
            <button
              onClick={() => setExerciseType('plank')}
              className={`px-4 py-2 rounded-md ${
                exerciseType === 'plank' ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              Plank
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-slate-700 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading posture detection model...</p>
            </div>
          </div>
        ) : cameraPermission === false ? (
          <div className="bg-red-900/50 p-6 rounded-lg text-center">
            <i className="fas fa-exclamation-triangle text-3xl mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
            <p>
              Please allow camera access to use the posture detection feature.
              You can update your browser settings to enable the camera.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                className="absolute top-0 left-0 w-full h-full object-contain"
                mirrored={true}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 items-center">
              <button
                onClick={toggleDetection}
                className={`px-6 py-3 rounded-md font-medium ${
                  isDetecting ? 'bg-red-600' : 'bg-blue-600'
                }`}
              >
                {isDetecting ? (
                  <>
                    <i className="fas fa-stop-circle mr-2"></i> Stop Detection
                  </>
                ) : (
                  <>
                    <i className="fas fa-play-circle mr-2"></i> Start Detection
                  </>
                )}
              </button>
              
              {feedback && (
                <div className={`px-4 py-2 rounded-md bg-slate-700 flex-1`}>
                  <i className="fas fa-info-circle mr-2"></i>
                  <span>{feedback}</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-slate-800 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2">How to use:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Select an exercise type (Squat, Push-up, or Plank)</li>
                <li>Position yourself so your full body is visible in the camera</li>
                <li>Click "Start Detection" to begin analyzing your form</li>
                <li>Follow the real-time feedback to improve your posture</li>
                <li>Click "Stop Detection" when you're finished</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostureDetection;
