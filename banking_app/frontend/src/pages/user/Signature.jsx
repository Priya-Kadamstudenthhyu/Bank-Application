import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';

const Signature = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [existing, setExisting] = useState(null);
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload'
  const [uploadedImg, setUploadedImg] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/user/signature').then(res => {
      if (res.data.signature) setExisting(res.data.signature);
    });
    // Set canvas background white
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    setIsDrawing(true);
    setLastPos(getPos(e, canvas));
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let signatureData = '';
      let signatureType = mode;

      if (mode === 'draw') {
        const canvas = canvasRef.current;
        signatureData = canvas.toDataURL('image/png');
      } else {
        if (!uploadedImg) {
          setMsg({ type: 'error', text: 'Please upload an image first' });
          setLoading(false);
          return;
        }
        signatureData = uploadedImg;
      }

      await api.post('/user/signature', { signature_data: signatureData, signature_type: signatureType });
      setExisting({ signature_data: signatureData, signature_type: signatureType });
      setMsg({ type: 'success', text: 'Signature saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Digital Signature</h1>
      <p className="text-gray-500 mb-8">Your signature is used for transaction verification</p>

      {msg.text && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {existing && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Current Signature</h2>
          <img src={existing.signature_data} alt="Current Signature" className="border rounded-lg max-w-xs" />
          <p className="text-xs text-gray-400 mt-2">Type: {existing.signature_type}</p>
        </div>
      )}

      <div className="bg-white border rounded-xl p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setMode('draw')}
            className={`px-4 py-2 rounded-lg font-medium ${mode === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            ✏️ Draw Signature
          </button>
          <button onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-lg font-medium ${mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            📤 Upload Image
          </button>
        </div>

        {mode === 'draw' ? (
          <div>
            <p className="text-sm text-gray-500 mb-3">Draw your signature below using mouse or touch:</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg inline-block">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="signature-canvas cursor-crosshair rounded-lg"
                style={{ display: 'block', touchAction: 'none' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>
            <div className="mt-3">
              <button onClick={clearCanvas}
                className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg">
                🗑️ Clear
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm text-gray-500 mb-3">Upload an image of your signature (PNG/JPG):</label>
            <input type="file" accept="image/*" onChange={handleUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {uploadedImg && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <img src={uploadedImg} alt="Preview" className="border rounded-lg max-w-xs" />
              </div>
            )}
          </div>
        )}

        <button onClick={handleSave} disabled={loading}
          className="mt-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
          {loading ? 'Saving...' : '💾 Save Signature'}
        </button>
      </div>
    </div>
  );
};

export default Signature;
