import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stage, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Modal3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  productName: string;
}

const Model = ({ url, onError }: { url: string; onError: () => void }) => {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
  } catch (error) {
    onError();
    return null;
  }
};

const Modal3DViewer = ({ isOpen, onClose, modelUrl, productName }: Modal3DViewerProps) => {
  const controlsRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(5);

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

  const handleError = () => {
    setHasError(true);
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
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <p className="text-muted-foreground text-center">
                Não foi possível carregar o modelo 3D.<br />
                Verifique se a URL está correta e acessível.
              </p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <span className="text-muted-foreground">Carregando modelo 3D...</span>
                </div>
              }
            >
              <Canvas camera={{ position: [0, 0, zoom], fov: 50 }}>
                <Stage environment="city" intensity={0.5}>
                  <Model url={modelUrl} onError={handleError} />
                </Stage>
                <OrbitControls 
                  ref={controlsRef}
                  autoRotate 
                  autoRotateSpeed={2}
                  enableZoom 
                  enablePan 
                  minDistance={2}
                  maxDistance={10}
                />
                <Environment preset="city" />
              </Canvas>
            </Suspense>
          )}

          {/* Controles de zoom e reset */}
          {!hasError && (
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

export default Modal3DViewer;
