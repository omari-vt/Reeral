"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import dynamic from "next/dynamic"

const Carte = dynamic(() => import("./Carte"), { ssr: false })

export default function Home() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [typeAnnonce, setTypeAnnonce] = useState("perdu")
  const [titre, setTitre] = useState("")
  const [lieu, setLieu] = useState("")
  const [description, setDescription] = useState("")
  const [utilisateur, setUtilisateur] = useState<any>(null)
  const [vueActive, setVueActive] = useState<"liste" | "carte">("liste")

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

  async function publierAnnonce() {
    if (!titre || !lieu) return
    await supabase.from("annonces").insert({
      type: typeAnnonce,
      titre: titre,
      lieu: lieu,
      date: "a l instant",
    })
    setTitre("")
    setLieu("")
    setDescription("")
    setFormulaireOuvert(false)
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
              <input type="text" placeholder="Lieu (ex: Marche Sandaga, Dakar)" value={lieu} onChange={(e) => setLieu(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 text-gray-900 bg-white" />
              <textarea placeholder="Description (couleur, marque, details...)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 resize-none text-gray-900 bg-white" />
              <button onClick={publierAnnonce} className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                Publier l annonce
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
                <div key={annonce.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${annonce.type === "perdu" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {annonce.type === "perdu" ? "Perdu" : "Trouve"}
                  </span>
                  <p className="font-medium mt-2">{annonce.titre}</p>
                  <p className="text-sm text-gray-500 mt-1">{annonce.lieu} - {annonce.date}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </main>
  )
}