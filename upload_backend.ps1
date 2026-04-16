$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$baseDir = "C:\Users\Dev\Downloads\delivery final\tmp\laravel_deploy"

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
        } catch {}
    }
}

function Upload-File {
    param($localFile, $remotePath)
    Write-Host "Subiendo $remotePath..."
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
        Write-Host "  OK"
    } catch {
        Write-Host "  FALLO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

$files = Get-ChildItem -Path $baseDir -Recurse -File
foreach ($file in $files) {
    if ($file.Name -eq "mototaxi_tarifas.sql") { continue } # No subimos el SQL por FTP
    $relPath = $file.FullName.Substring($baseDir.Length + 1) -replace '\\','/'
    $dirName = [System.IO.Path]::GetDirectoryName($relPath) -replace '\\','/'
    if (-not [string]::IsNullOrWhiteSpace($dirName)) {
        Create-RemoteDirectory -remotePath $dirName
    }
    Upload-File -localFile $file.FullName -remotePath $relPath
}
Write-Host "SUBIDA_BACKEND_COMPLETADA"
