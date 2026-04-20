"use client"

import { useEffect } from "react"
import "leaflet/dist/leaflet.css"

export default function Carte({ annonces }: { annonces: any[] }) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const L = require("leaflet")

    const container = document.getElementById("carte-reeral")
    if (!container) return
    if ((container as any)._leaflet_id) return

    const carte = L.map("carte-reeral").setView([14.6937, -17.4441], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap"
    }).addTo(carte)

    annonces.forEach((annonce) => {
      const couleur = annonce.type === "perdu" ? "#E24B4A" : "#639922"
      const icone = L.divIcon({
        html: `<div style="background:${couleur};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        className: ""
      })
      L.marker(
        [annonce.latitude || 14.6937, annonce.longitude || -17.4441],
        { icon: icone }
      )
        .addTo(carte)
        .bindPopup(`
          <strong>${annonce.titre}</strong><br>
          <span style="color:${couleur}">${annonce.type === "perdu" ? "Perdu" : "Trouve"}</span><br>
          ${annonce.lieu}
        `)
    })

    return () => {
      carte.remove()
    }
  }, [annonces])

  return (
    <div
      id="carte-reeral"
      style={{ height: "400px", width: "100%", borderRadius: "12px", zIndex: 0 }}
    />
  )
}