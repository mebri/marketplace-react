import { useParams, useNavigate } from "react-router-dom";

function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{ padding: "10px", background: "#1976d2", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: "white", color: "#1976d2", border: "none", padding: "8px 15px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
        >
          ← End Call
        </button>
        {/* ✅ Changed to Amharic */}
        <span style={{ fontWeight: "bold" }}>የኛ ገበያ Video Call</span>
      </div>

      {/* Jitsi iframe - Auto-join configuration added */}
      <div style={{ flex: 1 }}>
        <iframe
          src={`https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Video Call"
        />
      </div>
    </div>
  );
}

export default VideoCall;
