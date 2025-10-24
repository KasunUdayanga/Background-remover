
import React, { useState, useCallback } from 'react';
import { fileToBase64 } from './utils/fileUtils';
import { removeBackground } from './services/geminiService';
import { UploadCloud, Download, Wand2, Image as ImageIcon, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [processedImagePreview, setProcessedImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (originalImagePreview) {
        URL.revokeObjectURL(originalImagePreview);
      }
      setOriginalFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
      setProcessedImagePreview(null);
      setError(null);
    }
  };

  const handleRemoveBackground = useCallback(async () => {
    if (!originalFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProcessedImagePreview(null);

    try {
      const { base64, mimeType } = await fileToBase64(originalFile);
      const resultBase64 = await removeBackground(base64, mimeType);
      setProcessedImagePreview(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError('Failed to remove background. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalFile, isLoading]);

  const ImagePlaceholder: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 aspect-square text-slate-400">
        <h2 className="text-xl font-bold mb-4 text-slate-300 self-start">{title}</h2>
        <div className="flex-grow flex items-center justify-center w-full">
            {children}
        </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <Wand2 className="animate-pulse h-12 w-12 text-indigo-400" />
        <p className="text-lg">Removing background...</p>
        <p className="text-sm text-slate-500">This might take a moment.</p>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
            <Wand2 size={40} className="text-indigo-400"/>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            AI Background Remover
            </h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Upload an image and let Gemini magic create a transparent background for you.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Original Image Section */}
        <div className="space-y-4">
            {originalImagePreview ? (
                <div className="relative group aspect-square">
                    <img src={originalImagePreview} alt="Original" className="rounded-2xl w-full h-full object-contain bg-slate-800/50" />
                    <label htmlFor="file-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                        <span className="text-lg font-semibold">Change Image</span>
                    </label>
                </div>
            ) : (
                <ImagePlaceholder title="Original Image">
                     <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4 text-center p-4 hover:bg-slate-800 rounded-xl transition-colors">
                        <UploadCloud size={48} />
                        <span className="font-semibold">Click to upload an image</span>
                        <span className="text-xs">PNG, JPG, WEBP, etc.</span>
                    </label>
                </ImagePlaceholder>
            )}
            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Processed Image Section */}
        <div className="space-y-4">
            {isLoading ? (
                <ImagePlaceholder title="Result">
                    <LoadingSpinner />
                </ImagePlaceholder>
            ) : error ? (
                 <ImagePlaceholder title="Error">
                    <div className="flex flex-col items-center justify-center gap-4 text-red-400">
                        <XCircle size={48} />
                        <p className="text-lg font-semibold">An Error Occurred</p>
                        <p className="text-sm text-center">{error}</p>
                    </div>
                 </ImagePlaceholder>
            ) : processedImagePreview ? (
                <div className="relative group aspect-square">
                    <img src={processedImagePreview} alt="Processed" className="rounded-2xl w-full h-full object-contain bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23475569%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23475569%22%2F%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20y%3D%2210%22%20fill%3D%22%23334155%22%2F%3E%3Crect%20x%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23334155%22%2F%3E%3C%2Fsvg%3E')] bg-slate-800/50" />
                </div>
            ) : (
                <ImagePlaceholder title="Result">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <ImageIcon size={48} />
                        <p>Your processed image will appear here</p>
                    </div>
                </ImagePlaceholder>
            )}
        </div>
      </main>

      <footer className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleRemoveBackground}
          disabled={!originalFile || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 rounded-full text-lg font-bold hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:scale-100"
        >
          {isLoading ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
            </>
          ) : (
            <>
                <Wand2 size={24} />
                <span>Remove Background</span>
            </>
          )}
        </button>
        {processedImagePreview && (
            <a
                href={processedImagePreview}
                download="background-removed.png"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 rounded-full text-lg font-bold hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
            >
                <Download size={24} />
                <span>Download</span>
            </a>
        )}
      </footer>
    </div>
  );
};

export default App;
