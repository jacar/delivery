$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"

try {
    $url = "ftp://$ftpServer/"
    $ftp = [System.Net.FtpWebRequest]::Create($url)
    $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    
    $response = $ftp.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $files = $reader.ReadToEnd()
    $reader.Close()
    $response.Close()
    
    Write-Output "CONEXION_EXITOSA"
    Write-Output "Archivos en el servidor:"
    Write-Output $files
} catch {
    Write-Host "ERROR_DE_CONEXION: $($_.Exception.Message)" -ForegroundColor Red
}
