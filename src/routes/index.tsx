import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Delete, Check, ThumbsUp } from "lucide-react";
import welcomeBg from "@/assets/welcome-bg.png";
import icoFail from "@/assets/ico-fail.svg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Movistar con La Roja" },
      { name: "description", content: "Descarga tu vídeo Movistar con La Roja." },
    ],
  }),
});

const VALID_KEYS = ["1", "2", "3", "4", "A", "B", "C", "D"] as const;
const VALID_CODES = new Set(["ABCD", "1234", "A1B2", "ZDT4"]); // demo valid codes

type Stage = "welcome" | "code" | "qr";

function MovistarFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-blue p-0 sm:p-6">
      <div className="relative w-full max-w-[480px] aspect-[9/16] overflow-hidden bg-brand-blue shadow-2xl">
        {/* Movistar logo notch */}
        <div className="absolute top-0 right-0 z-20 bg-brand-white rounded-bl-2xl px-5 py-3 flex items-center justify-center">
          <MovistarLogo />
        </div>
        {children}
      </div>
    </div>
  );
}

function MovistarLogo() {
  return (
    <svg viewBox="0 0 40 32" className="w-10 h-8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Movistar">
      <path
        d="M2 26 C 2 10, 12 4, 16 14 C 18 19, 22 19, 24 14 C 28 4, 38 10, 38 26 C 34 22, 32 18, 30 22 C 28 26, 24 26, 22 22 C 20 18, 20 18, 18 22 C 16 26, 12 26, 10 22 C 8 18, 6 22, 2 26 Z"
        fill="var(--brand-blue)"
      />
    </svg>
  );
}

function WelcomeScreen({ onAccess }: { onAccess: () => void }) {
  return (
    <button
      onClick={onAccess}
      className="absolute inset-0 w-full h-full text-left"
      aria-label="Pulsa para acceder"
    >
      <img src={welcomeBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative z-10 flex flex-col h-full px-8 pt-[14%] pb-10">
        <h1 className="text-brand-white font-bold text-[clamp(2rem,7vw,3.25rem)] leading-[1.05] text-center tracking-tight">
          Descarga aquí<br />tu vídeo
        </h1>
        <div className="mt-auto">
          <div className="bg-brand-white rounded-xl py-5 px-6 text-center shadow-lg">
            <span className="text-brand-blue font-bold text-2xl">Pulsa para acceder</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function CodeScreen({ onSuccess }: { onSuccess: (code: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleKey = (k: string) => {
    setError(false);
    if (code.length < 4) setCode(code + k);
  };
  const handleDelete = () => {
    setError(false);
    setCode(code.slice(0, -1));
  };
  const handleConfirm = () => {
    if (code.length === 0) return;
    if (VALID_CODES.has(code.toUpperCase())) {
      onSuccess(code.toUpperCase());
    } else {
      setError(true);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center px-8 pt-[14%] pb-10 text-brand-white">
      {error ? (
        <>
          <img src={icoFail} alt="" className="w-24 h-auto mb-4" />
          <p className="text-center text-xl leading-snug">
            <span className="font-bold block text-2xl mb-1">¡Ups!</span>
            El código introducido no es correcto<br />o no existe. Inténtalo de nuevo.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-bold text-[clamp(2rem,7vw,3rem)] leading-[1.05] text-center">
            Descarga aquí<br />tu vídeo
          </h1>
          <p className="mt-6 text-center text-lg leading-snug">
            Introduce tu código personal<br />de 4 caracteres que te hemos facilitado<br />anteriormente.
          </p>
        </>
      )}

      <div
        className={`mt-8 w-[70%] min-h-[88px] rounded-xl flex items-center justify-center bg-brand-white text-brand-black font-bold text-5xl tracking-[0.15em] ${
          error ? "ring-4 ring-brand-fail" : ""
        }`}
      >
        {code || "\u00A0"}
      </div>

      <div className="mt-8 bg-keyboard-bg rounded-2xl p-3 grid grid-cols-5 gap-2 w-[88%]">
        {["1", "2", "3", "4"].map((n) => (
          <KeyButton key={n} onClick={() => handleKey(n)}>{n}</KeyButton>
        ))}
        <KeyButton onClick={handleDelete} aria-label="Borrar">
          <Delete className="w-6 h-6 mx-auto" strokeWidth={2} />
        </KeyButton>
        {["A", "B", "C", "D"].map((c) => (
          <KeyButton key={c} onClick={() => handleKey(c)}>{c}</KeyButton>
        ))}
        <button
          onClick={handleConfirm}
          aria-label="Confirmar"
          className="rounded-full bg-confirm-bg text-brand-blue aspect-square flex items-center justify-center hover:brightness-95 active:scale-95 transition"
        >
          <Check className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function KeyButton({
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className="bg-keyboard-key text-brand-black rounded-lg aspect-square text-2xl font-bold flex items-center justify-center shadow-sm hover:brightness-95 active:scale-95 transition"
      {...rest}
    >
      {children}
    </button>
  );
}

function QRScreen({ code, onReset }: { code: string; onReset: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Placeholder URL — swap for unique-per-user URL later.
  const targetUrl = useMemo(
    () => `https://www.movistar.es/?c=${encodeURIComponent(code)}`,
    [code],
  );

  useEffect(() => {
    QRCode.toDataURL(targetUrl, { width: 512, margin: 1 }).then(setQrDataUrl);
  }, [targetUrl]);

  return (
    <div className="absolute inset-0 flex flex-col px-8 pt-[14%] pb-10 text-brand-white">
      <h1 className="font-bold text-[clamp(1.75rem,6.5vw,2.75rem)] leading-[1.05]">
        ¡Tu vídeo está listo!
      </h1>
      <p className="mt-5 text-base leading-snug">
        Para descargar tu vídeo, captura este<br />código QR con tu teléfono móvil.
      </p>
      <p className="mt-3 text-base leading-snug">
        ¡No te olvides de compartirlo en redes<br />con el hashtag <strong>#MovistarConLaRoja!</strong>
      </p>

      <div className="mx-auto mt-6 bg-brand-white rounded-2xl p-4">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Código QR" className="w-48 h-48" />
        ) : (
          <div className="w-48 h-48" />
        )}
      </div>

      <p className="text-center font-bold text-2xl mt-5">#MovistarConLaRoja</p>

      <button
        onClick={onReset}
        className="mt-auto bg-brand-white rounded-xl py-4 px-6 flex items-center justify-center gap-3 shadow-lg text-brand-blue font-bold text-xl hover:brightness-95 active:scale-[0.99] transition"
      >
        <ThumbsUp className="w-6 h-6" />
        ¡Lo tengo!
      </button>
    </div>
  );
}

function Index() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [code, setCode] = useState("");

  return (
    <MovistarFrame>
      {stage === "welcome" && <WelcomeScreen onAccess={() => setStage("code")} />}
      {stage === "code" && (
        <CodeScreen
          onSuccess={(c) => {
            setCode(c);
            setStage("qr");
          }}
        />
      )}
      {stage === "qr" && <QRScreen code={code} onReset={() => setStage("welcome")} />}
    </MovistarFrame>
  );
}
