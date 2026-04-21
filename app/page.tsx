"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import dynamic from "next/dynamic"

const Carte = dynamic(() => import("./Carte"), { ssr: false })

const QUARTIERS = [
  { nom: "Plateau, Dakar", lat: 14.6937, lng: -17.4441 },
  { nom: "Medina, Dakar", lat: 14.6953, lng: -17.4537 },
  { nom: "Yoff, Dakar", lat: 14.7645, lng: -17.4906 },
  { nom: "Ngor, Dakar", lat: 14.7557, lng: -17.5139 },
  { nom: "Almadies, Dakar", lat: 14.7454, lng: -17.5227 },
  { nom: "Ouakam, Dakar", lat: 14.7277, lng: -17.4990 },
  { nom: "Mermoz, Dakar", lat: 14.7150, lng: -17.4782 },
  { nom: "Sacre Coeur, Dakar", lat: 14.7200, lng: -17.4700 },
  { nom: "Fann, Dakar", lat: 14.6990, lng: -17.4680 },
  { nom: "Point E, Dakar", lat: 14.7050, lng: -17.4590 },
  { nom: "Liberte, Dakar", lat: 14.7100, lng: -17.4550 },
  { nom: "Grand Dakar", lat: 14.7000, lng: -17.4400 },
  { nom: "Parcelles Assainies", lat: 14.7800, lng: -17.4200 },
  { nom: "Pikine", lat: 14.7500, lng: -17.3900 },
  { nom: "Guediawaye", lat: 14.7800, lng: -17.3700 },
  { nom: "Rufisque", lat: 14.7156, lng: -17.2736 },
  { nom: "Thiaroye", lat: 14.7300, lng: -17.3600 },
  { nom: "Marche Sandaga", lat: 14.6887, lng: -17.4382 },
  { nom: "Marche Kermel", lat: 14.6820, lng: -17.4390 },
  { nom: "Gare Routiere Pompiers", lat: 14.6950, lng: -17.4470 },
  { nom: "Aeroport LSS", lat: 14.7397, lng: -17.4902 },
  { nom: "UCAD, Dakar", lat: 14.6925, lng: -17.4631 },
  { nom: "Sea Plaza, Dakar", lat: 14.6780, lng: -17.4650 },
]

export default function Home() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [typeAnnonce, setTypeAnnonce] = useState("perdu")
  const [titre, setTitre] = useState("")
  const [quartier, setQuartier] = useState(QUARTIERS[0])
  const [description, setDescription] = useState("")
  const [utilisateur, setUtilisateur] = useState<any>(null)
  const [vueActive, setVueActive] = useState<"liste" | "carte">("liste")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    chargerAnnonces()
    verifierConnexion()
  }, [])

  async function verifierConnexion() {
    const { data } = await supabase.auth.getUser()
    if (data.user) setUtilisateur(data.user)
  }

  async function seDeconnecter() {
    await supabase.auth.signOut()
    setUtilisateur(null)
  }

  async function chargerAnnonces() {
    const { data } = await supabase
      .from("annonces")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setAnnonces(data)
  }

  function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function choisirQuartier(e: React.ChangeEvent<HTMLSelectElement>) {
    const q = QUARTIERS.find(q => q.nom === e.target.value)
    if (q) setQuartier(q)
  }

  async function publierAnnonce() {
    if (!titre || !quartier) return
    setUploading(true)

    let photoUrl = null
    if (photo) {
      const formData = new FormData()
      formData.append("file", photo)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      photoUrl = data.url
    }

    await supabase.from("annonces").insert({
      type: typeAnnonce,
      titre: titre,
      lieu: quartier.nom,
      date: "a l instant",
      photo_url: photoUrl,
      latitude: quartier.lat,
      longitude: quartier.lng,
    })

    setTitre("")
    setDescription("")
    setPhoto(null)
    setPhotoPreview(null)
    setFormulaireOuvert(false)
    setUploading(false)
    chargerAnnonces()
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-green-600">REERAL</h1>
        <div className="flex gap-3 items-center">
          {utilisateur ? (
            <>
              <span className="text-sm text-gray-500">{utilisateur.email}</span>
              <a href="/messages" className="px-4 py-2 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50">
                Messages
              </a>
              <button onClick={seDeconnecter} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                Connexion
              </a>
              <a href="/login" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                Inscription
              </a>
            </>
          )}
        </div>
      </nav>

      <div className="bg-green-600 text-white text-center py-12 px-6">
        <h2 className="text-2xl font-semibold mb-2">
          Retrouvez vos objets perdus au Senegal
        </h2>
        <p className="text-green-100 mb-6">
          La plateforme communautaire de reference
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setTypeAnnonce("perdu"); setFormulaireOuvert(true) }} className="px-6 py-3 bg-white text-green-600 font-medium rounded-xl">
            Objet perdu
          </button>
          <button onClick={() => { setTypeAnnonce("trouve"); setFormulaireOuvert(true) }} className="px-6 py-3 border border-white text-white font-medium rounded-xl">
            Objet trouve
          </button>
        </div>
      </div>

      {formulaireOuvert && (
        <div className="max-w-lg mx-auto mt-6 px-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {typeAnnonce === "perdu" ? "Signaler un objet perdu" : "Signaler un objet trouve"}
              </h2>
              <button onClick={() => setFormulaireOuvert(false)} className="text-gray-400 text-xl font-bold">
                X
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setTypeAnnonce("perdu")} className={`flex-1 py-2 rounded-lg text-sm font-medium ${typeAnnonce === "perdu" ? "bg-red-50 text-red-700 border border-red-200" : "border border-gray-200 text-gray-500"}`}>
                Perdu
              </button>
              <button onClick={() => setTypeAnnonce("trouve")} className={`flex-1 py-2 rounded-lg text-sm font-medium ${typeAnnonce === "trouve" ? "bg-green-50 text-green-700 border border-green-200" : "border border-gray-200 text-gray-500"}`}>
                Trouve
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Titre de l objet (ex: Telephone Samsung)" value={titre} onChange={(e) => setTitre(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 text-gray-900 bg-white" />
              <select onChange={choisirQuartier} value={quartier.nom} className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 text-gray-900 bg-white">
                {QUARTIERS.map((q) => (
                  <option key={q.nom} value={q.nom}>{q.nom}</option>
                ))}
              </select>
              <textarea placeholder="Description (couleur, marque, details...)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 resize-none text-gray-900 bg-white" />

              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                    <button onClick={() => { setPhoto(null); setPhotoPreview(null) }} className="absolute top-2 right-2 bg-white text-gray-500 rounded-full w-6 h-6 text-xs font-bold border border-gray-200">
                      X
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <p className="text-sm text-gray-400 mb-2">Ajouter une photo (optionnel)</p>
                    <p className="text-xs text-green-600 font-medium">Choisir une image</p>
                    <input type="file" accept="image/*" onChange={choisirPhoto} className="hidden" />
                  </label>
                )}
              </div>

              <button onClick={publierAnnonce} disabled={uploading} className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                {uploading ? "Publication en cours..." : "Publier l annonce"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            {annonces.length} annonces recentes
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setVueActive("liste")} className={`px-4 py-2 text-sm rounded-lg ${vueActive === "liste" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-500"}`}>
              Liste
            </button>
            <button onClick={() => setVueActive("carte")} className={`px-4 py-2 text-sm rounded-lg ${vueActive === "carte" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-500"}`}>
              Carte
            </button>
          </div>
        </div>

        {vueActive === "carte" ? (
          <Carte annonces={annonces} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {annonces.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-2 text-center py-8">
                Aucune annonce pour l instant. Soyez le premier a signaler !
              </p>
            ) : (
              annonces.map((annonce) => (
                <div key={annonce.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {annonce.photo_url && (
                    <img src={annonce.photo_url} alt={annonce.titre} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${annonce.type === "perdu" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {annonce.type === "perdu" ? "Perdu" : "Trouve"}
                    </span>
                    <p className="font-medium mt-2">{annonce.titre}</p>
                    <p className="text-sm text-gray-500 mt-1">{annonce.lieu} - {annonce.date}</p>
                    <a href={`/messages?annonce=${annonce.id}&titre=${encodeURIComponent(annonce.titre)}`} className="mt-3 block text-center bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                      Contacter
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </main>
  )
}