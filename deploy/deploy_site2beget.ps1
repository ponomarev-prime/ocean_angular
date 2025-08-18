param(
    [string]$FrontendDir = "../ocean-frontend",
    [string]$BuildDir = "../ocean-frontend/dist/ocean-frontend/browser"
)

# Загружаем переменные из beget.env
$envFile = "./beget.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*#") { return } # комментарии пропускаем
        $parts = $_.Split("=")
        if ($parts.Length -eq 2) {
            [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
        }
    }
} else {
    Write-Error "beget.env not found!"
    exit 1
}

$RemoteUser = $env:DEPLOY_USER
$RemoteHost = $env:DEPLOY_HOST
$RemotePath = $env:DEPLOY_PATH

Write-Host "==> Building Angular project..."
Push-Location $FrontendDir
npm run build -- --configuration production --base-href / --deploy-url /
Pop-Location

Write-Host "==> Cleaning remote directory..."
ssh "$RemoteUser@$RemoteHost" "rm -rf $RemotePath/*"

Write-Host "==> Uploading build to server..."
scp -r "$BuildDir/*" "$RemoteUser@${RemoteHost}:$RemotePath/"

Write-Host "==> Done! Site deployed."
