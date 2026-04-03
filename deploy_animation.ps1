$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$basePath = "C:\Users\Dev\Downloads\delivery final"

function Create-RemoteDirectory {
    param($remotePath)
    $parts = $remotePath.Split("/")
    $currentPath = ""
    foreach ($part in $parts) {
        if ([string]::IsNullOrWhiteSpace($part)) { continue }
        $currentPath += "$part/"
        try {
            $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$currentPath")
            $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
            $ftp.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $response = $ftp.GetResponse()
            $response.Close()
            Write-Host "Directorio creado o verificado: $currentPath"
        } catch {
            # Ignorar si ya existe
        }
    }
}

function Upload-File {
    param($localFile, $remotePath)
    # Asegurar que el directorio padre existe
    $dirPart = [System.IO.Path]::GetDirectoryName($remotePath).Replace("\", "/")
    if (![string]::IsNullOrWhiteSpace($dirPart)) {
        Create-RemoteDirectory -remotePath $dirPart
    }

    Write-Host "Subiendo $localFile a $remotePath..."
    try {
        $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$remotePath")
        $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $ftp.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $fileBytes = [System.IO.File]::ReadAllBytes($localFile)
        $ftp.ContentLength = $fileBytes.Length
        $rs = $ftp.GetRequestStream()
        $rs.Write($fileBytes, 0, $fileBytes.Length)
        $rs.Close()
        $response = $ftp.GetResponse()
        $response.Close()
        Write-Host "OK"
    } catch {
        Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1. Subir Componentes
Write-Host "Enviando componentes..."
Upload-File -localFile "$basePath\src\components\ScrollSequence.tsx" -remotePath "src/components/ScrollSequence.tsx"
Upload-File -localFile "$basePath\src\components\HomeInformativo.tsx" -remotePath "src/components/HomeInformativo.tsx"

# 2. Subir Fotogramas (331 archivos)
Write-Host "Enviando fotogramas (esto puede tardar unos minutos)..."
$fotogramasPath = "$basePath\src\fotogramas"
if (Test-Path $fotogramasPath) {
    $files = Get-ChildItem -Path $fotogramasPath -Filter *.jpg
    $total = $files.Count
    $count = 0
    foreach ($file in $files) {
        $count++
        $percent = [Math]::Round(($count / $total) * 100, 2)
        Write-Host "[$percent%] ($count/$total) " -NoNewline
        Upload-File -localFile $file.FullName -remotePath "src/fotogramas/$($file.Name)"
    }
}

Write-Host "DESPLIEGE_DE_ANIMACION_FINALIZADO"
