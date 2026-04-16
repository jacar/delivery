$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"

function Upload-Simple {
    param($local, $remote)
    Write-Host "Subiendo $local a $remote..."
    try {
        $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$remote")
        $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $ftp.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $bytes = [System.IO.File]::ReadAllBytes($local)
        $ftp.ContentLength = $bytes.Length
        $s = $ftp.GetRequestStream()
        $s.Write($bytes, 0, $bytes.Length)
        $s.Close()
        $ftp.GetResponse().Close()
        Write-Host "OK"
    } catch {
        Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Subir index.html (esto es CRÍTICO para que se carguen los nuevos bundles)
if (Test-Path "dist/index.html") { Upload-Simple -local "dist/index.html" -remote "public/index.html" }

# Subir banners
if (Test-Path "dist/banners/mobile.webp") { Upload-Simple -local "dist/banners/mobile.webp" -remote "public/banners/mobile.webp" }
if (Test-Path "dist/banners/desktop.webp") { Upload-Simple -local "dist/banners/desktop.webp" -remote "public/banners/desktop.webp" }

# Subir TODOS los assets actualizados (JS, CSS, etc.)
$assetsFiles = Get-ChildItem "dist/assets" -File
foreach ($af in $assetsFiles) { 
    Upload-Simple -local $af.FullName -remote "public/assets/$($af.Name)" 
}

Write-Host "DESPLIEGUE_RAPIDO_FINALIZADO"
