import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stage, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface Modal3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  productName: string;
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const Modal3DViewer = ({ isOpen, onClose, modelUrl, productName }: Modal3DViewerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{productName} - Visualização 3D</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full min-h-[400px] bg-gradient-to-b from-secondary to-background rounded-lg overflow-hidden">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando modelo 3D...</span>
              </div>
            }
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <Stage environment="city" intensity={0.5}>
                <Model url={modelUrl} />
              </Stage>
              <OrbitControls autoRotate enableZoom enablePan />
              <Environment preset="city" />
            </Canvas>
          </Suspense>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Arraste para girar • Scroll para zoom • Segure Shift + arraste para mover
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default Modal3DViewer;
