'use client';

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  useRoomInfo,
  useParticipants,
  useLocalParticipant,
} from '@livekit/components-react';
import { Room, Track, Participant, RemoteParticipant } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState, useCallback } from 'react';
import { useDebtCollectionAgent } from '../../components/DebtCollectionAgent';

export default function VoiceAgentRoom() {
  const [roomInstance] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }));

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'calling' | 'connected' | 'conversing'>('idle');

  // Default room and username for demo
  const room = 'debt-collection-room';
  const name = 'debt-collection-agent';

  useEffect(() => {
    let mounted = true;

    const connectToRoom = async () => {
      try {
        setError(null);
        setAgentStatus('calling');
        
        const resp = await fetch(`/api/token?room=${room}&username=${name}`);
        const data = await resp.json();
        
        if (!mounted) return;
        
        if (data.error) {
          setError(data.error);
          setAgentStatus('idle');
          return;
        }

        if (data.token) {
          await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, data.token);
          setIsConnected(true);
          setAgentStatus('connected');
        }
      } catch (e) {
        console.error('Connection error:', e);
        if (mounted) {
          setError('Failed to connect to room');
          setAgentStatus('idle');
        }
      }
    };

    connectToRoom();

    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance, room, name]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {agentStatus === 'calling' ? 'Connecting to Voice Agent...' : 'Initializing...'}
          </h2>
          <p className="text-gray-600">Setting up your debt collection voice agent</p>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={roomInstance}>
      <div data-lk-theme="default" className="h-screen bg-gray-900">
        <VoiceAgentInterface roomInstance={roomInstance} />
        <RoomAudioRenderer />
        <ControlBar />
      </div>
    </RoomContext.Provider>
  );
}

function VoiceAgentInterface({ roomInstance }: { roomInstance: Room }) {
  const roomInfo = useRoomInfo();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [conversationState, setConversationState] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [callLog, setCallLog] = useState<string[]>([]);
  const [customerInput, setCustomerInput] = useState<string>('');
  
  // AI Agent integration
  const {
    currentMessage,
    isSpeaking,
    startConversation,
    processCustomerInput,
    resetConversation,
    getState
  } = useDebtCollectionAgent();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const addCallLog = useCallback((message: string) => {
    setCallLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const handleStartConversation = useCallback(() => {
    startConversation();
    addCallLog('AI Agent: Started debt collection conversation');
  }, [startConversation, addCallLog]);

  const handleCustomerInput = useCallback(() => {
    if (customerInput.trim()) {
      processCustomerInput(customerInput);
      addCallLog(`Customer: ${customerInput}`);
      setCustomerInput('');
    }
  }, [customerInput, processCustomerInput, addCallLog]);

  useEffect(() => {
    if (!roomInstance) return;

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      addCallLog(`Customer ${participant.identity} joined the call`);
      setConversationState('active');
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      addCallLog(`Customer ${participant.identity} left the call`);
      setConversationState('ended');
    };

    roomInstance.on('participantConnected', handleParticipantConnected);
    roomInstance.on('participantDisconnected', handleParticipantDisconnected);

    return () => {
      roomInstance.off('participantConnected', handleParticipantConnected);
      roomInstance.off('participantDisconnected', handleParticipantDisconnected);
    };
  }, [roomInstance, addCallLog]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Debt Collection Voice Agent</h1>
            <p className="text-sm opacity-90">
              Status: {conversationState === 'waiting' ? 'Waiting for customer' : 
                      conversationState === 'active' ? 'In conversation' : 'Call ended'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Room: {roomInfo?.name}</div>
            <div className="text-sm opacity-90">Agent: {localParticipant?.identity}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <GridLayout 
            tracks={tracks} 
            className="h-full"
          >
            <ParticipantTile />
          </GridLayout>
        </div>

        {/* Call Log Sidebar */}
        <div className="w-80 bg-gray-800 text-white p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Call Log</h3>
          <div className="space-y-2">
            {callLog.map((log, index) => (
              <div key={index} className="text-sm bg-gray-700 p-2 rounded">
                {log}
              </div>
            ))}
            {callLog.length === 0 && (
              <div className="text-gray-400 text-sm">No activity yet...</div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex flex-col space-y-4">
          {/* AI Agent Status */}
          {currentMessage && (
            <div className="bg-blue-900 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-300">AI Agent:</span>
                <span className="text-white">{currentMessage}</span>
              </div>
            </div>
          )}
          
          {/* Customer Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomerInput()}
              placeholder="Simulate customer response..."
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleCustomerInput}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleStartConversation}
              disabled={isSpeaking}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Collection Script
            </button>
            <button
              onClick={resetConversation}
              className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700"
            >
              Reset Conversation
            </button>
            <button
              onClick={() => {
                addCallLog('Agent ended call');
                roomInstance.disconnect();
              }}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              End Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
