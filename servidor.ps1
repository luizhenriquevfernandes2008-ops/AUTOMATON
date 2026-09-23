# Servidorzinho local do AUTOMATON (só PowerShell, nada pra instalar).
# Abre o jogo em http://localhost:8765/
param([int]$Port = 8765, [switch]$NoBrowser)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'; '.glb' = 'model/gltf-binary'; '.gltf' = 'model/gltf+json'; '.png' = 'image/png'
  '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.hdr' = 'application/octet-stream'; '.ogg' = 'audio/ogg'
  '.mp3' = 'audio/mpeg'; '.wav' = 'audio/wav'; '.woff2' = 'font/woff2'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.md' = 'text/plain; charset=utf-8'
}

$listener = $null
for ($p = $Port; $p -lt $Port + 10; $p++) {
  try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$p/")
    $listener.Start()
    $Port = $p
    break
  } catch { $listener = $null }
}
if (-not $listener) { Write-Host "Nao consegui abrir uma porta local :(" -ForegroundColor Red; Read-Host "Enter pra sair"; exit 1 }

$url = "http://localhost:$Port/"
Write-Host ""
Write-Host "  AUTOMATON rodando em $url" -ForegroundColor Yellow
Write-Host "  Deixe esta janela aberta enquanto joga. Feche pra desligar." -ForegroundColor Gray
Write-Host ""
if (-not $NoBrowser) { Start-Process $url }

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq '/') { $path = '/index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
    if (-not $file.StartsWith($root) -or -not (Test-Path $file -PathType Leaf)) {
      $res.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes('404')
      $res.OutputStream.Write($b, 0, $b.Length)
    } else {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control', 'no-cache')
      $bytes = [IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      if ($req.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
    }
    $res.OutputStream.Close()
  } catch {
    try { $ctx.Response.Abort() } catch {}
  }
}
