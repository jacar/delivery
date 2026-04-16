$ftpServer = "ftp.strongmeropower.com"
$user = "rapi@webcincodev.com"
$pass = "Forastero_938"

function List-RemoteFiles {
    param($remotePath)
    Write-Host "Listing $remotePath..."
    try {
        $ftp = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/$remotePath")
        $ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $ftp.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
        $response = $ftp.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $content = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()
        Write-Host $content
    } catch {
        Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

List-RemoteFiles -remotePath "public/"
