import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: "dzjufonor",
  api_key: "159955782372621",
  api_secret: "3ktZufbzltL4tNmiA9v5hXvKHAs",
})

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file = data.get("file") as File
  if (!file) return NextResponse.json({ error: "Pas de fichier" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "reeral" },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })

  return NextResponse.json({ url: (result as any).secure_url })
}