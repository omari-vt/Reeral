"use client"

import { useState } from "react"
import { supabase } from "../supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion")
  const [message, setMessage] = useState("")
  const [chargement, setChargement] = useState(false)

  async function handleSubmit() {
    if (!email || !motDePasse) return
    setChargement(true)
    setMessage("")

    if (mode === "inscription") {
      const { error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
      })
      if (error) {
        setMessage("Erreur : " + error.message)
      } else {
        setMessage("Compte cree ! Verifie ton email pour confirmer.")
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
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-md">

        <h1 className="text-xl font-semibold text-green-600 text-center mb-2">
          REERAL
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === "connexion" ? "Connecte-toi a ton compte" : "Cree ton compte gratuitement"}
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("connexion")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              mode === "connexion"
                ? "bg-green-600 text-white"
                : "border border-gray-200 text-gray-500"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode("inscription")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              mode === "inscription"
                ? "bg-green-600 text-white"
                : "border border-gray-200 text-gray-500"
            }`}
          >
            Inscription
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 text-gray-900 bg-white"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 text-gray-900 bg-white"
          />

          {message && (
            <p className="text-sm text-center text-green-600 bg-green-50 py-2 px-4 rounded-lg">
              {message}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={chargement}
            className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium mt-2"
          >
            {chargement ? "Chargement..." : mode === "connexion" ? "Se connecter" : "Creer mon compte"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          <a href="/" className="text-green-600">
            Retour a l accueil
          </a>
        </p>

      </div>
    </main>
  )
}