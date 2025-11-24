import React, { useEffect, useState } from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { Loader, ThemeProvider } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// ⚠️ FIXED CONFIGURATION FOR AMPLIFY V6 ⚠️
Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: 'ap-northeast-1:4ad3569e-4c1a-4010-9f26-f1f0d96a7bec',
      region: 'ap-northeast-1',
      allowGuestAccess: true
    }
  }
});

function App() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');

    if (id) {
      setSessionId(id);
      setLoading(false);
    } else {
      console.error("No session_id found in URL");
      setLoading(false);
    }
  }, []);

  const handleAnalysisComplete = async () => {
    console.log("Liveness Check Complete");
    if (window.FlutterChannel) {
      window.FlutterChannel.postMessage('COMPLETE');
    }
  };

  const handleError = (error) => {
    console.error(error);
    if (window.FlutterChannel) {
      window.FlutterChannel.postMessage('ERROR: ' + error.state);
    }
  };

  const handleCancel = () => {
    console.log("User canceled operation");
    if (window.FlutterChannel) {
      window.FlutterChannel.postMessage('CANCEL');
    } else {
      alert("Cancel clicked");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'white' }}>
        <Loader size="large" variation="linear" />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div style={{ height: '100vh', backgroundColor: 'white', color: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <p>Waiting for Session ID...</p>
        <p style={{ fontSize: '12px', color: '#666' }}>(If testing in browser, add ?session_id=test to URL)</p>
      </div>
    );
  }

  const customDisplayText = {
    instructionsHeaderText: 'Face Verification',
    instructionsMessageText: 'Please position your face in the oval.',
    startScreenBeginCheckText: 'Start Scanning',
  };

  const theme = {
    name: 'liveness-theme',
    tokens: {
      colors: {
        primary: {
          80: '#000000',
          90: '#000000',
          100: '#000000',
        },
        background: {
          primary: '#ffffff',
        }
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'white', position: 'relative' }}>

        {/* ⚠️ I REMOVED THE <style> BLOCK HERE ⚠️ 
            This ensures the Header ("Face Verification") and Alerts show up again.
        */}

        {/* --- Close Button --- */}
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>

        <FaceLivenessDetector
          sessionId={sessionId}
          region="ap-northeast-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          displayText={customDisplayText}

          // ⚠️ REVERTED: Set to FALSE to show the "Start Scanning" instruction screen again
          disableInstructionScreen={false}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;