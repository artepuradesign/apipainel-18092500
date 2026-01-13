import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stage, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

interface Modal3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  productName: string;
}

// Componente separado para carregar o modelo
const ModelLoader = ({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: string) => void }) => {
  const { scene } = useGLTF(url, true, true, (loader) => {
    // Configure loader for cross-origin
    loader.setCrossOrigin('anonymous');
  });
  
  useEffect(() => {
    if (scene) {
      onLoad();
    }
  }, [scene, onLoad]);

  return <primitive object={scene} />;
};

// Error boundary wrapper
const ModelWithErrorBoundary = ({ url, onError }: { url: string; onError: (error: string) => void }) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Pre-validate URL
    if (!url) {
      setLoadError("URL do modelo não fornecida");
      onError("URL do modelo não fornecida");
      return;
    }

    // Reset states when URL changes
    setLoadError(null);
    setIsLoaded(false);
  }, [url, onError]);

  if (loadError) {
    return null;
  }

  return (
    <ModelLoader 
      url={url} 
      onLoad={() => setIsLoaded(true)}
      onError={(error) => {
        setLoadError(error);
        onError(error);
      }}
    />
  );
};

const Modal3DViewer = ({ isOpen, onClose, modelUrl, productName }: Modal3DViewerProps) => {
  const controlsRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [zoom, setZoom] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when modal opens/closes or URL changes
  useEffect(() => {
    if (isOpen) {
      setHasError(false);
      setErrorMessage("");
      setIsLoading(true);
      setZoom(5);
    }
  }, [isOpen, modelUrl]);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const newZoom = Math.max(zoom - 1, 2);
      setZoom(newZoom);
      controlsRef.current.object.position.z = newZoom;
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const newZoom = Math.min(zoom + 1, 10);
      setZoom(newZoom);
      controlsRef.current.object.position.z = newZoom;
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      setZoom(5);
    }
  };

  const handleError = (error: string) => {
    console.error("Erro ao carregar modelo 3D:", error);
    setHasError(true);
    setErrorMessage(error);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle WebGL context errors
  const onCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    gl.setClearColor(new THREE.Color('#1a1a2e'), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{productName}</span>
            <span className="text-muted-foreground text-sm font-normal">- Visualização 3D</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 h-full min-h-[400px] bg-gradient-to-b from-secondary to-background rounded-lg overflow-hidden">
          {hasError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <div className="text-center space-y-2">
                <p className="text-foreground font-medium">
                  Não foi possível carregar o modelo 3D.
                </p>
                <p className="text-muted-foreground text-sm">
                  {errorMessage || "Verifique se a URL está correta e acessível."}
                </p>
                <div className="mt-4 p-3 bg-muted rounded-lg text-left">
                  <p className="text-xs font-medium mb-1">URL do modelo:</p>
                  <p className="text-xs text-muted-foreground break-all">{modelUrl}</p>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Possíveis causas:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>O servidor não permite CORS (Cross-Origin)</li>
                    <li>O arquivo não é um GLB/GLTF válido</li>
                    <li>A URL não está acessível publicamente</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <span className="text-muted-foreground">Carregando modelo 3D...</span>
                </div>
              )}
              <Canvas 
                camera={{ position: [0, 0, zoom], fov: 50 }}
                onCreated={onCreated}
                onError={() => handleError("Erro no WebGL")}
              >
                <Suspense fallback={null}>
                  <Stage environment="city" intensity={0.5}>
                    <ModelWithErrorBoundary 
                      url={modelUrl} 
                      onError={handleError}
                    />
                  </Stage>
                  <OrbitControls 
                    ref={controlsRef}
                    autoRotate 
                    autoRotateSpeed={2}
                    enableZoom 
                    enablePan 
                    minDistance={2}
                    maxDistance={10}
                    onEnd={() => setIsLoading(false)}
                  />
                  <Environment preset="city" />
                </Suspense>
              </Canvas>
            </>
          )}

          {/* Controles de zoom e reset */}
          {!hasError && !isLoading && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                size="icon" 
                variant="secondary" 
                onClick={handleZoomIn}
                className="h-9 w-9 shadow-lg"
                title="Aproximar"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="secondary" 
                onClick={handleZoomOut}
                className="h-9 w-9 shadow-lg"
                title="Afastar"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="secondary" 
                onClick={handleReset}
                className="h-9 w-9 shadow-lg"
                title="Resetar câmera"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          Arraste para girar • Scroll para zoom • Segure Shift + arraste para mover
        </p>
      </DialogContent>
    </Dialog>
  );
};

// Preload function for external use
export const preloadModel = (url: string) => {
  useGLTF.preload(url);
};

export default Modal3DViewer;
