import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useEffect, useRef, useState } from "react";
import HeaderProfile from "../components/HeaderProfile";
import "../App.css";
import { Link } from "react-router-dom";
import { Diamond, SquarePenIcon, LogOutIcon, Upload as UploadIcon, X as XIcon } from "lucide-react";

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const STORAGE_KEY = user ? `account_banner_${user.uid}` : null;

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error("Erro ao fazer logout:", error);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (STORAGE_KEY) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBgUrl(saved);
    }
    return () => {};
  }, [STORAGE_KEY]);

  const fileToDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const acceptImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Escolha um arquivo de imagem válido.");
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      alert("Imagem grande demais (máx ~4.5MB para salvar localmente).");
      return;
    }
    const dataUrl = await fileToDataURL(file);
    setBgUrl(dataUrl);
    if (STORAGE_KEY) localStorage.setItem(STORAGE_KEY, dataUrl);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await acceptImage(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    await acceptImage(file);
  };

  const clearBg = () => {
    setBgUrl(null);
    if (STORAGE_KEY) localStorage.removeItem(STORAGE_KEY);
  };

  if (!user) return null;

  return (
    <>
      <HeaderProfile />
      <div
        className="d-flex flex-column justify-content-start align-items-start rounded vw-100"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        <div
          className={`position-relative w-100 d-flex justify-content-center align-items-center ${
            dragOver ? "border border-3 border-primary" : ""
          }`}
          style={{
            width: "100%",
            height: "220px",
            backgroundColor: "#f8f9fa",
            backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "box-shadow .2s ease, border-color .2s ease",
            overflow: "hidden",
            borderRadius: "0",
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {!bgUrl && (
            <div className="text-center">
            <UploadIcon className="mb-2" />
            <h5 className="mb-1">Imagem de fundo do perfil</h5>
            <p className="text-muted mb-3">Arraste uma imagem aqui ou selecione um arquivo</p>
            <button
                className="btn btn-outline-primary"
                onClick={() => fileInputRef.current?.click()}
            >
                Escolher imagem
            </button>
            </div>
        )}

        <div className="position-absolute top-0 end-0 p-2 d-flex gap-2" style={{ zIndex: 2 }}>
            <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            hidden
            />
            <button
            className="btn btn-light btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Trocar imagem"
            >
            <UploadIcon size={16} className="me-1" />
            Trocar
            </button>
            {bgUrl && (
            <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearBg}
                title="Remover imagem"
            >
                <XIcon size={16} className="me-1" />
                Remover
            </button>
            )}
        </div>

        {bgUrl && (
            <div
            className="position-absolute w-100 h-100"
            style={{
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.25))",
                zIndex: 1,
                pointerEvents: "none",
            }}
            />
        )}
        </div>

        <div className="d-flex justify-content-center align-items-center w-100 p-4">
          <div className="d-flex flex-column justify-content-start align-items-start w-100 p-2">
            <div className="d-flex justify-content-between align-items-start w-100">
              <div className="d-flex align-items-center">
                <img
                  src={user.photoURL ?? ""}
                  alt={user.displayName ?? "Usuário"}
                  className="rounded-circle me-4"
                  style={{ width: "90px", height: "90px", objectFit: "cover" }}
                />
                <div>
                  <h1 className="text-white fw-medium mb-1">
                    {user.displayName ?? "Usuário"}
                  </h1>
                  <p className="mb-0 text-dark-emphasis">@thomaz_mellux</p>
                  <p className="mb-0 text-dark-emphasis">{user.email}</p>
                  <p className="mb-0 text-dark-emphasis">+55 (12) 98707-2463</p>
                </div>
              </div>
              <div
                className="d-flex flex-column justify-content-between align-items-center"
                style={{ height: "auto" }}
              >
                <Link
                  to="/plans"
                  className="btn btn-outline-light d-flex justify-content-between align-items-center mb-2"
                  style={{ width: "140px" }}
                >
                  Plans
                  <Diamond size={16} className="ms-2" />
                </Link>
                <button
                  className="btn btn-outline-light d-flex justify-content-between align-items-center"
                  style={{ width: "140px" }}
                >
                  Edit profile
                  <SquarePenIcon size={16} className="ms-2" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline-light mt-2 d-flex justify-content-between align-items-center"
                  style={{ width: "140px" }}
                >
                  Sign out
                  <LogOutIcon size={16} className="ms-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
