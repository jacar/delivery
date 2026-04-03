param([string]$path = "")

$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"
$url = "ftp://$ftpServer/$path"

try {
    $ftp = [System.Net.FtpWebRequest]::Create($url)
    $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $ftp.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    
    $response = $ftp.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $files = $reader.ReadToEnd()
    $reader.Close()
    $response.Close()
    
    Write-Output $files
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
