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
      const label = annonce.type === "perdu" ? "Perdu" : "Trouve"
      const bgLabel = annonce.type === "perdu" ? "#FCEBEB" : "#EAF3DE"

      const icone = L.divIcon({
        html: `<div style="background:${couleur};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [16, 16],
        className: ""
      })

      const photoHtml = annonce.photo_url
        ? `<img src="${annonce.photo_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>`
        : ""

      const popup = L.popup({ maxWidth: 220, className: "reeral-popup" }).setContent(`
        <div style="font-family:sans-serif;padding:4px">
          ${photoHtml}
          <span style="background:${bgLabel};color:${couleur};font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">${label}</span>
          <p style="font-size:14px;font-weight:600;margin:6px 0 2px;color:#111">${annonce.titre}</p>
          <p style="font-size:12px;color:#888;margin:0 0 8px">${annonce.lieu}</p>
          <p style="font-size:12px;color:#555;margin:0 0 10px">${annonce.date}</p>
          <a href="/messages?annonce=${annonce.id}&titre=${encodeURIComponent(annonce.titre)}" style="display:block;background:#1D9E75;color:white;text-align:center;padding:8px;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none">
            Contacter
          </a>
        </div>
      `)

      L.marker(
        [annonce.latitude || 14.6937, annonce.longitude || -17.4441],
        { icon: icone }
      )
        .addTo(carte)
        .bindPopup(popup)
    })

    return () => {
      carte.remove()
    }
  }, [annonces])

  return (
    <div
      id="carte-reeral"
      style={{ height: "450px", width: "100%", borderRadius: "12px", zIndex: 0 }}
    />
  )
}