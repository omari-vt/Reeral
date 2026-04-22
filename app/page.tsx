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
  const [nomProfil, setNomProfil] = useState("")
  const [vueActive, setVueActive] = useState<"liste" | "carte">("liste")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [recherche, setRecherche] = useState("")
  const [filtre, setFiltre] = useState<"tous" | "perdu" | "trouve" | "resolu">("tous")
  const [messagesNonLus, setMessagesNonLus] = useState(0)

  useEffect(() => {
    chargerAnnonces()
    verifierConnexion()
  }, [])

  async function verifierConnexion() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUtilisateur(data.user)
      const { data: profil } = await supabase
        .from("profils")
        .select("nom")
        .eq("user_id", data.user.id)
        .single()
      if (profil) setNomProfil(profil.nom)
      chargerMessagesNonLus(data.user.email!)
      ecouterNotifications(data.user.email!)
    }
  }

  async function chargerMessagesNonLus(email: string) {
    const { data } = await supabase
      .from("messages")
      .select("id")
      .eq("destinataire_email", email)
      .eq("lu", false)
    if (data) setMessagesNonLus(data.length)
  }

  function ecouterNotifications(email: string) {
    supabase
      .channel("messages-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `destinataire_email=eq.${email}`,
      }, () => {
        chargerMessagesNonLus(email)
      })
      .subscribe()
  }

  async function seDeconnecter() {
    await supabase.auth.signOut()
    setUtilisateur(null)
    setNomProfil("")
    setMenuOuvert(false)
    setMessagesNonLus(0)
  }

  async function chargerAnnonces() {
    const { data } = await supabase
      .from("annonces")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setAnnonces(data)
  }

  async function marquerResolu(id: number) {
    await supabase.from("annonces").update({ statut: "resolu" }).eq("id", id)
    chargerAnnonces()
  }

  function partagerWhatsApp(annonce: any) {
    const texte = `REERAL — ${annonce.type === "perdu" ? "Objet perdu" : "Objet trouve"}: ${annonce.titre} a ${annonce.lieu}. Voir sur REERAL !`
    const url = `https://wa.me/?text=${encodeURIComponent(texte)}`
    window.open(url, "_blank")
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
      statut: "actif",
    })
    setTitre("")
    setDescription("")
    setPhoto(null)
    setPhotoPreview(null)
    setFormulaireOuvert(false)
    setUploading(false)
    chargerAnnonces()
  }

  const nomAffiche = nomProfil || utilisateur?.email?.split("@")[0] || ""
  const initiale = nomAffiche.charAt(0).toUpperCase()

  const annoncesFiltrees = annonces.filter((a) => {
    const matchRecherche = a.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
      a.lieu?.toLowerCase().includes(recherche.toLowerCase())
    const matchFiltre = filtre === "tous" ? true :
      filtre === "resolu" ? a.statut === "resolu" :
      a.type === filtre && a.statut !== "resolu"
    return matchRecherche && matchFiltre
  })

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <h1 className="text-lg font-bold text-green-600 tracking-tight">REERAL</h1>
        <div className="flex gap-2 items-center">
          {utilisateur ? (
            <>
              <a href="/messages" className="relative p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {messagesNonLus > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {messagesNonLus > 9 ? "9+" : messagesNonLus}
                  </span>
                )}
              </a>
              <div className="relative">
                <button onClick={() => setMenuOuvert(!menuOuvert)} className="flex items-center gap-2 px-2 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">{initiale}</div>
                  <span className="text-sm font-medium text-gray-800 hidden sm:block">{nomAffiche}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>
                {menuOuvert && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 mb-0.5">Connecte en tant que</p>
                      <p className="text-sm font-bold text-gray-900">{nomAffiche}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Email prive</p>
                    </div>
                    <a href="/messages" className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <span className="flex items-center gap-2"><span>✉</span> Mes messages</span>
                      {messagesNonLus > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{messagesNonLus}</span>
                      )}
                    </a>
                    <button onClick={seDeconnecter} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                      <span>↪</span> Deconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Connexion</a>
              <a href="/login" className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Inscription</a>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-green-600 text-white text-center py-10 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Retrouvez vos objets perdus au Senegal</h2>
        <p className="text-green-100 text-sm sm:text-base mb-5">La plateforme communautaire de reference</p>
        <div className="max-w-lg mx-auto mb-5">
          <input
            type="text"
            placeholder="Rechercher un objet, un quartier..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm outline-none shadow bg-white placeholder-gray-400"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
          <button onClick={() => { setTypeAnnonce("perdu"); setFormulaireOuvert(true) }} className="w-full sm:w-auto px-6 py-3.5 bg-white text-green-700 font-semibold rounded-xl shadow hover:shadow-md transition text-base">
            J ai perdu un objet
          </button>
          <button onClick={() => { setTypeAnnonce("trouve"); setFormulaireOuvert(true) }} className="w-full sm:w-auto px-6 py-3.5 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-green-700 transition text-base">
            J ai trouve un objet
          </button>
        </div>
      </div>

      {/* FORMULAIRE */}
      {formulaireOuvert && (
        <div className="mx-auto mt-6 px-4 max-w-lg">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-900">{typeAnnonce === "perdu" ? "Signaler un objet perdu" : "Signaler un objet trouve"}</h2>
              <button onClick={() => setFormulaireOuvert(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-sm">X</button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTypeAnnonce("perdu")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${typeAnnonce === "perdu" ? "bg-red-100 text-red-700 border border-red-300" : "border border-gray-200 text-gray-500"}`}>Perdu</button>
              <button onClick={() => setTypeAnnonce("trouve")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${typeAnnonce === "trouve" ? "bg-green-100 text-green-700 border border-green-300" : "border border-gray-200 text-gray-500"}`}>Trouve</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Titre de l objet</label>
                <input type="text" placeholder="Ex: Telephone Samsung Galaxy A54" value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quartier</label>
                <select onChange={choisirQuartier} value={quartier.nom} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white outline-none focus:border-green-500">
                  {QUARTIERS.map((q) => (<option key={q.nom} value={q.nom}>{q.nom}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea placeholder="Couleur, marque, signes particuliers..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white outline-none focus:border-green-500 resize-none" />
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                    <button onClick={() => { setPhoto(null); setPhotoPreview(null) }} className="absolute top-2 right-2 bg-white text-gray-600 rounded-full w-7 h-7 text-xs font-bold border border-gray-200 shadow">X</button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <p className="text-sm font-medium text-gray-500 mb-1">Ajouter une photo</p>
                    <p className="text-xs text-gray-400 mb-2">optionnel — JPG, PNG</p>
                    <span className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg">Choisir une image</span>
                    <input type="file" accept="image/*" onChange={choisirPhoto} className="hidden" />
                  </label>
                )}
              </div>
              <button onClick={publierAnnonce} disabled={uploading} className="bg-green-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-60">
                {uploading ? "Publication en cours..." : "Publier l annonce"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNONCES */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        <div className="flex flex-wrap gap-2 mb-4">
          {["tous", "perdu", "trouve", "resolu"].map((f) => (
            <button key={f} onClick={() => setFiltre(f as any)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${filtre === f ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600"}`}>
              {f === "tous" ? "Tous" : f === "perdu" ? "Perdus" : f === "trouve" ? "Trouves" : "Resolus"}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold text-gray-500 self-center">{annoncesFiltrees.length} annonce{annoncesFiltrees.length > 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button onClick={() => setVueActive("liste")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${vueActive === "liste" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600"}`}>Liste</button>
            <button onClick={() => setVueActive("carte")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${vueActive === "carte" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600"}`}>Carte</button>
          </div>
        </div>

        {vueActive === "carte" ? (
          <Carte annonces={annoncesFiltrees} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {annoncesFiltrees.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-2 text-center py-12">
                {recherche ? `Aucun resultat pour "${recherche}"` : "Aucune annonce pour l instant."}
              </p>
            ) : (
              annoncesFiltrees.map((annonce) => (
                <div key={annonce.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition ${annonce.statut === "resolu" ? "border-green-200 opacity-75" : "border-gray-200"}`}>
                  {annonce.photo_url && (
                    <img src={annonce.photo_url} alt={annonce.titre} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${annonce.type === "perdu" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {annonce.type === "perdu" ? "Perdu" : "Trouve"}
                      </span>
                      {annonce.statut === "resolu" && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">Resolu</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{annonce.titre}</p>
                    <p className="text-xs text-gray-500 mt-1">{annonce.lieu}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{annonce.date}</p>
                    <div className="flex gap-2 mt-3">
                      {annonce.statut !== "resolu" && (
                        <a href={`/messages?annonce=${annonce.id}&titre=${encodeURIComponent(annonce.titre)}`} className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition">Contacter</a>
                      )}
                      <button onClick={() => partagerWhatsApp(annonce)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-green-600 text-xs font-medium">WhatsApp</button>
                      {utilisateur && annonce.statut !== "resolu" && (
                        <button onClick={() => marquerResolu(annonce.id)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-blue-600 text-xs font-medium">Resolu</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* BARRE DE NAVIGATION MOBILE EN BAS */}
      {utilisateur && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-40 sm:hidden">
          <button onClick={() => setVueActive("liste")} className={`flex flex-col items-center gap-1 ${vueActive === "liste" ? "text-green-600" : "text-gray-400"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span className="text-xs font-medium">Annonces</span>
          </button>
          <button onClick={() => setVueActive("carte")} className={`flex flex-col items-center gap-1 ${vueActive === "carte" ? "text-green-600" : "text-gray-400"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            <span className="text-xs font-medium">Carte</span>
          </button>
          <button onClick={() => { setTypeAnnonce("perdu"); setFormulaireOuvert(true) }} className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center -mt-5 shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span className="text-xs font-medium text-green-600">Signaler</span>
          </button>
          <a href="/messages" className="flex flex-col items-center gap-1 text-gray-400 relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {messagesNonLus > 0 && <span className="absolute -top-1 right-2 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{messagesNonLus}</span>}
            <span className="text-xs font-medium">Messages</span>
          </a>
          <button onClick={() => setMenuOuvert(!menuOuvert)} className="flex flex-col items-center gap-1 text-gray-400">
            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">{initiale}</div>
            <span className="text-xs font-medium">Profil</span>
          </button>
        </div>
      )}

      {utilisateur && <div className="h-16 sm:hidden" />}

    </main>
  )
}