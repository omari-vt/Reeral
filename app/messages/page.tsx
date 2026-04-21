"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([])
  const [utilisateur, setUtilisateur] = useState<any>(null)
  const [contenu, setContenu] = useState("")
  const [envoye, setEnvoye] = useState(false)
  const [annonceTitre, setAnnonceTitre] = useState("")
  const [annonceId, setAnnonceId] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setAnnonceTitre(params.get("titre") || "")
    setAnnonceId(params.get("annonce") || "")
    verifierConnexion()
  }, [])

  async function verifierConnexion() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUtilisateur(data.user)
      chargerMessages()
    }
  }

  async function chargerMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setMessages(data)
  }

  async function envoyerMessage() {
    if (!contenu || !utilisateur) return
    await supabase.from("messages").insert({
      contenu: contenu,
      expediteur_email: utilisateur.email,
      annonce_id: annonceId,
      annonce_titre: annonceTitre,
    })
    setContenu("")
    setEnvoye(true)
    chargerMessages()
  }

  if (!utilisateur) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 rounded-xl p-8">
          <p className="text-gray-500 mb-4">Tu dois etre connecte pour envoyer un message</p>
          <a href="/login" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
            Se connecter
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-xl font-semibold text-green-600">REERAL</a>
        <span className="text-sm text-gray-500">{utilisateur.email}</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {annonceTitre && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h1 className="text-lg font-semibold mb-1">Contacter pour cette annonce</h1>
            <p className="text-sm text-green-600 mb-4">{annonceTitre}</p>
            {envoye ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-medium text-sm">Message envoye !</p>
                <p className="text-green-600 text-xs mt-1">Le proprietaire va recevoir ton message</p>
                <a href="/" className="mt-3 inline-block text-sm text-green-600 underline">
                  Retour aux annonces
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  placeholder="Ecris ton message ici..."
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  rows={4}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-400 resize-none text-gray-900 bg-white"
                />
                <button onClick={envoyerMessage} className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                  Envoyer le message
                </button>
              </div>
            )}
          </div>
        )}

        <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">
          {messages.length} messages recus
        </h2>

        {messages.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">Aucun message pour l instant</p>
            <a href="/" className="text-green-600 text-sm mt-2 block">Retour aux annonces</a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">{msg.expediteur_email}</span>
                  <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-green-600 mb-2">Re: {msg.annonce_titre}</p>
                <p className="text-sm text-gray-700">{msg.contenu}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}