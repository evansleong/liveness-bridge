import React, { useEffect, useState } from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { Loader, ThemeProvider } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// ⚠️ FIXED CONFIGURATION FOR AMPLIFY V6 ⚠️
Amplify.configure({
  Auth: {
    Cognito: {
      // Ensure this is your TOKYO Identity Pool ID
      identityPoolId: 'ap-northeast-1:4ad3569e-4c1a-4010-9f26-f1f0d96a7bec', 
      region: 'ap-northeast-1',
      allowGuestAccess: true // <--- This is required in v6
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'black' }}>
        <Loader size="large" variation="linear" />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div style={{ height: '100vh', backgroundColor: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <p>Waiting for Session ID...</p>
        <p style={{fontSize: '12px', color: '#666'}}>(If testing in browser, add ?session_id=test to URL)</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
        <FaceLivenessDetector
          sessionId={sessionId}
          region="ap-northeast-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          disableInstructionScreen={false}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;