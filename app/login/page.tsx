"use client"

import { useState } from "react"
import { supabase } from "../supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [nom, setNom] = useState("")
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion")
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(false)

  async function handleSubmit() {
    if (!email || !motDePasse) return
    if (mode === "inscription" && !nom) {
      setMessage("Entre un nom d utilisateur")
      return
    }
    setChargement(true)
    setMessage("")

    if (mode === "inscription") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
      })
      if (error) {
        setMessage("Erreur : " + error.message)
      } else if (data.user) {
        await supabase.from("profils").insert({
          user_id: data.user.id,
          nom: nom,
        })
        setMessage("Compte cree ! Tu peux maintenant te connecter.")
        setMode("connexion")
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: motDePasse,
      })
      if (error) {
        setMessage("Email ou mot de passe incorrect.")
      } else {
        window.location.href = "/"
      }
    }
    setChargement(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm">

        <h1 className="text-2xl font-bold text-green-600 text-center mb-1">REERAL</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === "connexion" ? "Connecte-toi a ton compte" : "Cree ton compte gratuitement"}
        </p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => { setMode("connexion"); setMessage("") }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${mode === "connexion" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            Connexion
          </button>
          <button onClick={() => { setMode("inscription"); setMessage("") }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${mode === "inscription" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            Inscription
          </button>
        </div>

        <div className="flex flex-col gap-3">

          {mode === "inscription" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Nom d utilisateur (visible par tous)
              </label>
              <input
                type="text"
                placeholder="Ex: Mamadou, Fatou, DialloDakar..."
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-green-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email (prive — non visible par les autres)
            </label>
            <input
              type="email"
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Minimum 6 caracteres"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-green-500"
            />
          </div>

          {message && (
            <p className={`text-sm text-center py-2 px-4 rounded-xl ${message.includes("Erreur") || message.includes("incorrect") || message.includes("Entre") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={chargement}
            className="bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-60 mt-1"
          >
            {chargement ? "Chargement..." : mode === "connexion" ? "Se connecter" : "Creer mon compte"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          <a href="/" className="text-green-600 hover:underline">Retour a l accueil</a>
        </p>

      </div>
    </main>
  )
}