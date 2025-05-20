
import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton, XR, useXR, Interactive } from '@react-three/xr';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

function ARFurniture({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  const ref = useRef();
  const [position, setPosition] = useState([0, 0, -0.5]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [scale, setScale] = useState(0.5);
  const { isPresenting } = useXR();

  // Clone and prepare the model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  // AR hit testing setup
  useEffect(() => {
    if (!isPresenting) return;

    let frameId;
    let hitTestSource = null;
    let hitTestSourceRequested = false;

    const onXRFrame = (time, frame) => {
      if (!frame) return;
      
      const referenceSpace = frame.session.getReferenceSpace();
      
      if (!hitTestSourceRequested) {
        frame.session.requestReferenceSpace('viewer').then((viewerSpace) => {
          frame.session.requestHitTestSource({ space: viewerSpace }).then((source) => {
            hitTestSource = source;
          });
        });
        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          
          if (pose) {
            const position = pose.transform.position;
            const orientation = pose.transform.orientation;
            
            setPosition([position.x, position.y, position.z]);
            
            // Convert quaternion to Euler angles
            const quaternion = new THREE.Quaternion(
              orientation.x, 
              orientation.y, 
              orientation.z, 
              orientation.w
            );
            const euler = new THREE.Euler().setFromQuaternion(quaternion);
            setRotation([0, euler.y, 0]); // Usually we only want Y rotation for furniture
          }
        }
      }
      
      frameId = requestAnimationFrame(() => onXRFrame(time, frame));
    };

    frameId = requestAnimationFrame(onXRFrame);
    
    return () => {
      cancelAnimationFrame(frameId);
      if (hitTestSource) {
        hitTestSource.cancel();
        hitTestSource = null;
      }
    };
  }, [isPresenting]);

  // Interactive furniture model
  return (
    <Interactive
      onSelect={() => {
        // Toggle between two sizes when tapped
        setScale(scale === 0.5 ? 0.75 : 0.5);
      }}
    >
      <primitive
        ref={ref}
        object={scene.clone()}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    </Interactive>
  );
}

function ModelSelector({ models, onSelectModel }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '10px',
      right: '10px',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      zIndex: 100
    }}>
      {models.map((model) => (
        <button
          key={model.url}
          onClick={() => onSelectModel(model.url)}
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
}

// AR Device compatibility check
function ARCompatibilityCheck() {
  const [checkingCompatibility, setCheckingCompatibility] = useState(true);
  const [isCompatible, setIsCompatible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkARCompatibility = async () => {
      try {
        // Check if WebXR is available
        if (!navigator.xr) {
          setErrorMessage('WebXR не поддерживается в этом браузере');
          setIsCompatible(false);
          return;
        }

        // Check if immersive-ar is supported
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!arSupported) {
          setErrorMessage('AR не поддерживается на вашем устройстве');
          setIsCompatible(false);
          return;
        }

        // All checks passed
        setIsCompatible(true);
      } catch (error) {
        console.error('Error checking AR compatibility:', error);
        setErrorMessage('Ошибка при проверке совместимости AR');
        setIsCompatible(false);
      } finally {
        setCheckingCompatibility(false);
      }
    };

    checkARCompatibility();
  }, []);

  if (checkingCompatibility) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        zIndex: 1000
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Проверка совместимости AR...</h2>
        </div>
      </div>
    );
  }

  if (!isCompatible) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        zIndex: 1000
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{errorMessage || 'AR не поддерживается на вашем устройстве'}</h2>
          <p>Попробуйте открыть в Chrome на Android или Safari на iOS</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function ARViewer() {
  const [selectedModel, setSelectedModel] = useState('/seat.glb');
  const [isInAR, setIsInAR] = useState(false);

  // Available models
  const models = [
    { name: 'Диван', url: '/seat.glb' },
    { name: 'Стол', url: '/seat.glb' },
    { name: 'Стул', url: '/seat.glb' }
  ];

  // Track AR session state
  useEffect(() => {
    const handleSessionStarted = () => setIsInAR(true);
    const handleSessionEnded = () => setIsInAR(false);

    window.addEventListener('ar-session-started', handleSessionStarted);
    window.addEventListener('ar-session-ended', handleSessionEnded);

    return () => {
      window.removeEventListener('ar-session-started', handleSessionStarted);
      window.removeEventListener('ar-session-ended', handleSessionEnded);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ARCompatibilityCheck />
      
      {!isInAR && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '10px', 
          right: '10px', 
          textAlign: 'center',
          zIndex: 10 
        }}>
          <h1 style={{ color: 'black', margin: 0 }}>AR Просмотр Мебели</h1>
          <p>Нажмите кнопку "Запустить AR" чтобы начать</p>
        </div>
      )}
      
      <ARButton 
        sessionInit={{
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body }
        }} 
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          padding: '12px 24px',
          background: 'black',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Запустить AR
      </ARButton>
      
      {!isInAR && (
        <ModelSelector models={models} onSelectModel={setSelectedModel} />
      )}
      
      <Canvas
        style={{ background: 'transparent' }}
        camera={{ position: [0, 0, 0], near: 0.1, far: 20 }}
      >
        <XR
          onSessionStart={() => {
            window.dispatchEvent(new Event('ar-session-started'));
          }}
          onSessionEnd={() => {
            window.dispatchEvent(new Event('ar-session-ended'));
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <ARFurniture modelUrl={selectedModel} />
          
          {/* Instructions in AR */}
          <Text
            position={[0, 0.1, -0.5]}
            fontSize={0.05}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            Нажмите на мебель для изменения размера
          </Text>
        </XR>
      </Canvas>
    </div>
  );
}