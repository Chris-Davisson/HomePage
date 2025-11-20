import { ConversionData } from "./types";

export const CONVERSION_BRAIN: ConversionData = {
  conversions: {
    text_docs: [
      {
        input: ["md", "markdown"],
        targets: [
          { ext: "pdf", desc: "Print Ready PDF", engine: "pandoc", cmd: "pandoc {input} -o {output}" },
          { ext: "html", desc: "Web Page", engine: "pandoc", cmd: "pandoc {input} -o {output}" },
          { ext: "docx", desc: "MS Word", engine: "pandoc", cmd: "pandoc {input} -o {output}" }
        ]
      },
      {
        input: ["docx"],
        targets: [
          { ext: "pdf", desc: "PDF Document", engine: "pandoc", cmd: "pandoc {input} -o {output}" },
          { ext: "md", desc: "Markdown Source", engine: "pandoc", cmd: "pandoc {input} -o {output} --wrap=none" },
          { ext: "txt", desc: "Plain Text", engine: "pandoc", cmd: "pandoc {input} -t plain -o {output}" }
        ]
      },
      {
         input: ["txt"],
         targets: [
             { ext: "pdf", desc: "PDF Document", engine: "pandoc", cmd: "pandoc {input} -o {output}" },
             { ext: "md", desc: "Markdown", engine: "pandoc", cmd: "pandoc {input} -o {output}" }
         ]
      },
      {
        input: ["pdf"],
        targets: [
            { ext: "txt", desc: "Extract Text", engine: "pdf.js", cmd: "pdf-extract {input} > {output}" },
            { ext: "pdf", desc: "Compress (High)", engine: "ghostscript", cmd: "gs -dPDFSETTINGS=/screen -o {output} {input}", isOptimization: true },
            { ext: "pdf", desc: "Compress (Medium)", engine: "ghostscript", cmd: "gs -dPDFSETTINGS=/ebook -o {output} {input}", isOptimization: true },
            { ext: "jpg", desc: "Rasterize Pages", engine: "imagemagick", cmd: "magick -density 300 {input} {output}" },
            { ext: "docx", desc: "Convert to Word", engine: "libreoffice", cmd: "soffice --convert-to docx {input}" }
        ]
      }
    ],
    images: [
      {
        input: ["png", "jpg", "jpeg", "webp"],
        targets: [
          { ext: "png", desc: "Lossless PNG", engine: "imagemagick", cmd: "magick {input} {output}" },
          { ext: "jpg", desc: "Compress JPG (80%)", engine: "imagemagick", cmd: "magick {input} -quality 80 {output}", isOptimization: true },
          { ext: "jpg", desc: "Compress JPG (50%)", engine: "imagemagick", cmd: "magick {input} -quality 50 {output}", isOptimization: true },
          { ext: "webp", desc: "Web Optimized", engine: "imagemagick", cmd: "magick {input} -quality 75 {output}", isOptimization: true },
          { ext: "ico", desc: "Windows Icon", engine: "imagemagick", cmd: "magick {input} -resize 256x256 {output}" },
          { ext: "avif", desc: "Next-Gen AVIF", engine: "imagemagick", cmd: "magick {input} {output}" }
        ]
      },
      {
        input: ["svg"],
        targets: [
          { ext: "png", desc: "Rasterize to PNG", engine: "imagemagick", cmd: "magick -background none {input} {output}" },
          { ext: "webp", desc: "Web Optimized", engine: "imagemagick", cmd: "magick -background none {input} {output}" },
          { ext: "svg", desc: "Minify SVG", engine: "svgo", cmd: "svgo {input} -o {output}", isOptimization: true }
        ]
      }
    ],
    video_audio: [
      {
        input: ["mkv", "mov", "avi", "webm", "mp4"],
        targets: [
          { ext: "mp4", desc: "Universal MP4", engine: "ffmpeg", cmd: "ffmpeg -i {input} -c:v libx264 -crf 23 {output}" },
          { ext: "mp4", desc: "Compress Video (720p)", engine: "ffmpeg", cmd: "ffmpeg -i {input} -vf scale=-1:720 -crf 28 {output}", isOptimization: true },
          { ext: "mp3", desc: "Extract Audio", engine: "ffmpeg", cmd: "ffmpeg -i {input} -vn -acodec libmp3lame {output}" },
          { ext: "gif", desc: "Animated GIF", engine: "ffmpeg", cmd: "ffmpeg -i {input} -vf \"fps=15,scale=480:-1\" {output}" }
        ]
      },
      {
        input: ["wav", "flac", "mp3", "m4a"],
        targets: [
          { ext: "mp3", desc: "Convert to MP3", engine: "ffmpeg", cmd: "ffmpeg -i {input} -ab 320k {output}" },
          { ext: "aac", desc: "AAC Audio", engine: "ffmpeg", cmd: "ffmpeg -i {input} -c:a aac {output}" },
          { ext: "wav", desc: "Uncompressed WAV", engine: "ffmpeg", cmd: "ffmpeg -i {input} {output}" }
        ]
      }
    ],
    archives: [
        {
            input: ["zip", "tar", "gz", "7z", "rar"],
            targets: [
                { ext: "folder", desc: "Extract All", engine: "wasm-archive", cmd: "7z x {input} -o{output}" },
                { ext: "zip", desc: "Repack to ZIP", engine: "wasm-archive", cmd: "7z a -tzip {output} {input}" },
                { ext: "tar", desc: "Repack to TAR", engine: "wasm-archive", cmd: "7z a -ttar {output} {input}" }
            ]
        }
    ]
  }
};