import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { ArrowRight, Delete, Play, Star } from "lucide-react";
import bgImage from "@/assets/bg-image.png";
import marcoAzul from "@/assets/marco-azul.png";
import marco from "@/assets/marco.png";
import checkedIcon from "@/assets/checked.svg";
import icoFail from "@/assets/ico-fail.svg";
import icoOk from "@/assets/ico-ok.svg";

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
const CODE_LENGTH = 3;
const VALID_CODES = new Set(["123", "ABC", "A1B", "B2C", "D4A"]); // demo valid codes

type Stage = "welcome" | "code" | "video" | "survey" | "qr";

function MovistarFrame({
  children,
  variant = "light",
}: {
  children: React.ReactNode;
  variant?: "light" | "dark";
}) {
  const frameSrc = variant === "dark" ? marcoAzul : marco;
  const bg = "bg-brand-blue";
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black p-0 sm:p-6">
      <div className={`relative w-full max-w-[480px] aspect-[9/16] overflow-hidden ${bg} shadow-2xl`}>
        {children}
        <img
          src={frameSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full z-30"
        />
      </div>
    </div>
  );
}

function WelcomeScreen({ onAccess }: { onAccess: () => void }) {
  return (
    <button
      onClick={onAccess}
      className="absolute inset-0 w-full h-full text-left"
      aria-label="Pulsa para acceder"
    >
      <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative z-10 flex flex-col h-full px-10 pt-[26%] pb-[10%]">
        <div className="mt-[118%]">
          <div className="bg-brand-white rounded-md py-4 px-6 text-center shadow-lg mx-auto w-[80%]">
            <span className="text-brand-blue font-bold text-xl">Descarga tu vídeo aquí</span>
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
    if (code.length < CODE_LENGTH) setCode(code + k);
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
    <div className="absolute inset-0 flex flex-col items-center px-10 pt-[26%] pb-[8%] text-brand-white">
      {error ? (
        <>
          <img src={icoFail} alt="" className="w-24 h-auto mb-4 mt-[16px]" />
          <p className="text-center text-base leading-snug text-brand-white">
            <span className="font-bold block text-xl mb-1">¡Ups!</span>
            El código introducido no es correcto<br />o no existe. Inténtalo de nuevo.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-bold text-[clamp(1.5rem,5vw,2.25rem)] leading-[1.1] text-center text-brand-white my-[8px] mt-[16px]">
            Descarga aquí<br />tu vídeo
          </h1>
          <p className="mt-4 text-center text-sm leading-snug text-brand-white">
            Introduce tu código personal<br />de 3 caracteres que te hemos facilitado<br />anteriormente.
          </p>
        </>
      )}

      <div
        className={`w-[35%] min-h-[52px] flex items-center justify-center bg-brand-white text-brand-black font-bold text-2xl tracking-[0.2em] my-[14px] mb-[8px] mt-[32px] rounded-sm ${
          error ? "ring-2 ring-brand-fail" : ""
        }`}
      >
        {code || "\u00A0"}
      </div>

      <div className="mt-6 rounded-2xl grid grid-cols-5 gap-2 w-[70%]">
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
          className="aspect-square rounded-md bg-brand-white flex items-center justify-center hover:brightness-95 active:scale-95 transition shadow-sm"
        >
          <img src={checkedIcon} alt="" className="w-1/2 h-1/2" />
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
    <div className="absolute inset-0 flex flex-col items-center px-10 pt-[26%] pb-[8%] text-brand-white">
      <h1 className="font-bold text-[clamp(1.5rem,5vw,2.25rem)] leading-[1.1] text-center text-brand-white my-[8px] mt-[16px]">
        ¡Tu vídeo está listo!
      </h1>
      <p className="mt-3 text-center text-sm leading-snug text-brand-white">
        Para descargar tu vídeo, captura este<br />código QR con tu teléfono móvil.
      </p>
      <p className="mt-3 text-center text-sm leading-snug text-brand-white">
        Estará disponible para su descarga durante las próximas 24h. Pasado ese tiempo, tu vídeo será eliminado. ¡Descárgalo ahora!
      </p>

      <div className="mt-[6%] bg-brand-white rounded-md p-3 border-2 border-brand-white">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Código QR" className="w-[33vw] max-w-[160px] aspect-square" />
        ) : (
          <div className="w-[33vw] max-w-[160px] aspect-square" />
        )}
      </div>

      <p className="mt-4 text-center font-bold text-xl text-brand-white">#MovistarConLaRoja</p>

      <button
        onClick={onReset}
        className="mt-6 w-[80%] mx-auto bg-brand-white rounded-md py-4 px-6 flex items-center justify-center gap-3 shadow-lg text-brand-blue font-bold text-xl hover:brightness-95 active:scale-[0.99] transition"
      >
        <img src={icoOk} alt="" className="w-6 h-6" />
        ¡Lo tengo!
      </button>
    </div>
  );
}

function VideoScreen({ onNext }: { onNext: () => void }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="absolute inset-0 flex flex-col items-center px-10 pt-[26%] pb-[18%] text-brand-white">
      <h1 className="font-bold text-[clamp(1.5rem,5vw,2.25rem)] leading-[1.1] text-center text-brand-white my-[8px] mt-[16px]">
        ¡Tu vídeo está listo!
      </h1>
      <p className="mt-3 text-center text-sm leading-snug text-brand-white">
        Para visualizarlo, pulsa en el PLAY.<br />
        Para descárgalo pulsa en el botón ‘Siguiente’
      </p>

      <div className="mt-[5%] w-[58%] aspect-[9/16] bg-brand-black rounded-md flex items-center justify-center overflow-hidden">
        {playing ? (
          <video
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            className="w-full h-full object-cover"
            autoPlay
            controls
            playsInline
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label="Reproducir"
            className="w-full h-full flex items-center justify-center hover:scale-105 transition"
          >
            <Play className="w-16 h-16 text-brand-white" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-[80%] mx-auto bg-brand-white rounded-md py-4 px-6 flex items-center justify-center gap-3 shadow-lg text-brand-blue font-bold text-xl hover:brightness-95 active:scale-[0.99] transition"
      >
        <ArrowRight className="w-6 h-6" />
        Siguiente
      </button>
    </div>
  );
}

const SURVEY_QUESTIONS = [
  {
    q: "¿Maecenas non magna dictum, condimentum leo posuere, porta est?",
    options: [
      "Cras eu dolor ut facilisis pulvinar",
      "Curabitur at sem nibh",
      "Aenean feugiat ullamcorper tempor",
    ],
  },
  {
    q: "¿Quisque consequat lectus eget magna?",
    options: [
      "Vestibulum ante ipsum primis",
      "Donec sit amet libero",
      "Phasellus vel mauris",
    ],
  },
  {
    q: "¿Integer placerat purus eget velit?",
    options: [
      "Suspendisse potenti dapibus",
      "Nam vitae nibh tristique",
      "Aliquam erat volutpat",
    ],
  },
  {
    q: "En general, ¿cómo valorarías tu experiencia siendo 5 la puntuación\nmás alta?",
    type: "stars" as const,
    options: ["1", "2", "3", "4", "5"],
  },
];

function SurveyScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    SURVEY_QUESTIONS.map(() => null),
  );
  const current = SURVEY_QUESTIONS[step];
  const selected = answers[step];

  const choose = (i: number) => {
    const next = [...answers];
    next[step] = i;
    setAnswers(next);
    setTimeout(() => {
      if (step < SURVEY_QUESTIONS.length - 1) setStep(step + 1);
      else onComplete();
    }, 250);
  };

  return (
    <div className="absolute inset-0 flex flex-col px-10 pt-[26%] pb-[10%] text-brand-white">
      <h1 className="font-bold text-[clamp(1.5rem,5vw,2.25rem)] leading-[1.05] text-brand-white my-[8px] mt-[16px] mx-[16px]">
        Tu opinión<br />nos importa
      </h1>
      <p className="mt-4 text-sm leading-snug text-brand-white mx-[16px]">
        Mientras preparamos la descarga de tu vídeo,
        nos gustaría que respondieras a unas preguntas
        acerca de la experiencia.
      </p>

      <p className="mt-6 font-bold text-base text-brand-white mx-[16px]">{current.q}</p>

      {(current as { type?: string }).type === "stars" ? (
        <div className="flex items-center justify-center gap-3 mx-[16px] mt-[32px]">
          {current.options.map((_, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              aria-label={`${i + 1} estrella${i === 0 ? "" : "s"}`}
              className="active:scale-95 transition"
            >
              <Star
                className={`w-10 h-10 ${
                  selected !== null && i <= selected
                    ? "fill-brand-white text-brand-white"
                    : "text-brand-white"
                }`}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>
      ) : (
      <div className="mt-4 flex flex-col gap-3 mx-[16px]">
        {current.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className="flex items-center gap-3 text-left text-brand-white"
          >
            <span
              className={`shrink-0 w-6 h-6 rounded-full border-2 border-brand-white flex items-center justify-center ${
                selected === i ? "bg-brand-white" : ""
              }`}
            >
              {selected === i && (
                <span className="w-3 h-3 rounded-full bg-brand-blue" />
              )}
            </span>
            <span className="text-base leading-snug">{opt}</span>
          </button>
        ))}
      </div>
      )}

      <div className="mt-auto mb-[32px] flex items-center justify-center gap-2">
        {SURVEY_QUESTIONS.map((_, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex items-center gap-2 my-[56px]">
              <span
                className={`w-3 h-3 rounded-full border-2 border-brand-white ${
                  done || active ? "bg-brand-white" : "bg-transparent"
                }`}
              />
              {i < SURVEY_QUESTIONS.length - 1 && (
                <span className="w-8 h-px bg-brand-white" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Index() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [code, setCode] = useState("");

  return (
    <MovistarFrame variant="light">
      {stage === "welcome" && <WelcomeScreen onAccess={() => setStage("code")} />}
      {stage === "code" && (
        <CodeScreen
          onSuccess={(c) => {
            setCode(c);
            setStage("video");
          }}
        />
      )}
      {stage === "video" && <VideoScreen onNext={() => setStage("survey")} />}
      {stage === "survey" && <SurveyScreen onComplete={() => setStage("qr")} />}
      {stage === "qr" && <QRScreen code={code} onReset={() => setStage("welcome")} />}
    </MovistarFrame>
  );
}
