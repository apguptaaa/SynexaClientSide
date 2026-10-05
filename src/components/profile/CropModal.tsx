import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

export function CropModal({
  isOpen,
  cropSrc,
  crop,
  setCrop,
  zoom,
  setZoom,
  setCroppedAreaPixels,
  onClose,
  onSave
}: {
  isOpen: boolean
  cropSrc: string | null
  crop: { x: number; y: number }
  setCrop: (crop: { x: number; y: number }) => void
  zoom: number
  setZoom: (zoom: number) => void
  setCroppedAreaPixels: (area: Area | null) => void
  onClose: () => void
  onSave: () => void
}) {
  if (!isOpen || !cropSrc) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center font-sans p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-[440px] rounded-2xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden border border-gray-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-[#1f2937] dark:text-slate-100 tracking-[-0.01em]">Crop & Adjust Avatar</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100 cursor-pointer transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[340px] w-full bg-[#18181b]">
          <Cropper
            image={cropSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            style={{
              containerStyle: { backgroundColor: '#18181b' },
              cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.65)' }
            }}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_croppedArea, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>

        {/* Controls */}
        <div className="p-5 bg-white dark:bg-[#0f172a] space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider shrink-0">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#2563eb] cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none"
            />
            <span className="text-xs font-bold text-gray-600 dark:text-slate-300 w-8 text-right">{zoom.toFixed(1)}x</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-2.5 px-4 rounded-xl border-none bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-xs font-extrabold cursor-pointer  hover:shadow-[0_6px_20px_rgba(140,8,23,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

