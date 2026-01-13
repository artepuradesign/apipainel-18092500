import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { AlertCircle, Loader2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface Modal3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  productName: string;
}

function Model({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    if (scene && onLoaded) {
      // Normalize model size
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim; // Normalize to fit in a 2 unit box
      scene.scale.setScalar(scale);
      
      // Center the model
      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center.multiplyScalar(scale));
      
      onLoaded();
    }
  }, [scene, onLoaded]);
  
  return <primitive object={scene} />;
}

export default function Modal3DViewerV2({ isOpen, onClose, modelUrl, productName }: Modal3DViewerProps) {
  const controlsRef = useRef<any>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  const normalizedUrl = useMemo(() => (modelUrl || "").trim(), [modelUrl]);

  useEffect(() => {
    let cancelled = false;
    let objectUrlToRevoke: string | null = null;

    async function prepare() {
      if (!isOpen) return;

      setError(null);
      setLocalUrl(null);
      setIsPreparing(true);
      setIsModelReady(false);

      if (!normalizedUrl) {
        setError("URL do modelo 3D não informada.");
        setIsPreparing(false);
        return;
      }

      try {
        const res = await fetch(normalizedUrl, { method: "GET" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ao baixar o arquivo`);
        }

        const blob = await res.blob();
        objectUrlToRevoke = URL.createObjectURL(blob);

        if (cancelled) return;
        setLocalUrl(objectUrlToRevoke);
      } catch (e: any) {
        if (cancelled) return;

        const msg = typeof e?.message === "string" ? e.message : "Falha ao baixar o modelo";
        const corsHint = msg.toLowerCase().includes("failed to fetch")
          ? " Provável bloqueio de CORS no servidor do arquivo (precisa liberar Access-Control-Allow-Origin)."
          : "";

        setError(`${msg}.${corsHint}`);
      } finally {
        if (!cancelled) setIsPreparing(false);
      }
    }

    prepare();

    return () => {
      cancelled = true;
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [isOpen, normalizedUrl]);

  const handleModelLoaded = () => {
    setIsModelReady(true);
  };

  const handleZoomIn = () => {
    if (!controlsRef.current) return;
    controlsRef.current.object.position.z = Math.max(controlsRef.current.object.position.z - 0.5, 1.5);
    controlsRef.current.update();
  };

  const handleZoomOut = () => {
    if (!controlsRef.current) return;
    controlsRef.current.object.position.z = Math.min(controlsRef.current.object.position.z + 0.5, 8);
    controlsRef.current.update();
  };

  const handleReset = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span>{productName}</span>
            <span className="text-muted-foreground text-sm font-normal">- Visualização 3D</span>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 min-h-0 bg-gradient-to-b from-secondary to-background rounded-lg overflow-hidden">
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <div className="text-center space-y-2 max-w-2xl">
                <p className="text-foreground font-medium">Não foi possível carregar o modelo 3D.</p>
                <p className="text-muted-foreground text-sm">{error}</p>
                <div className="mt-4 p-3 bg-muted rounded-lg text-left">
                  <p className="text-xs font-medium mb-1">URL do modelo:</p>
                  <p className="text-xs text-muted-foreground break-all">{normalizedUrl}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {(isPreparing || !isModelReady) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    {isPreparing ? "Baixando modelo 3D..." : "Renderizando..."}
                  </span>
                </div>
              )}

              {localUrl && (
                <div className="absolute inset-0">
                  <Canvas 
                    key={localUrl} 
                    camera={{ position: [0, 0, 4], fov: 45 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <directionalLight position={[-10, -10, -5]} intensity={0.4} />
                    <Suspense fallback={null}>
                      <Center>
                        <Model url={localUrl} onLoaded={handleModelLoaded} />
                      </Center>
                      <OrbitControls
                        ref={controlsRef}
                        autoRotate
                        autoRotateSpeed={1.5}
                        enableZoom
                        enablePan
                        minDistance={1.5}
                        maxDistance={8}
                        makeDefault
                      />
                      <Environment preset="city" />
                    </Suspense>
                  </Canvas>
                </div>
              )}
            </>
          )}

          {!error && isModelReady && (
            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
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

        <p className="text-sm text-muted-foreground text-center flex-shrink-0 pt-2">
          Arraste para girar • Scroll para zoom • Segure Shift + arraste para mover
        </p>
      </DialogContent>
    </Dialog>
  );
}
