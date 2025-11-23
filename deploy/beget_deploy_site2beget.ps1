<#
  deploy_site2beget.ps1
  Собирает Angular фронт и заливает содержимое папки dist/.../browser на Beget.

  Требования:
  - рядом со скриптом лежит beget.env с переменными:
      DEPLOY_USER=...
      DEPLOY_HOST=...
      DEPLOY_PATH=/home/USER/DOMAIN/public_html   (папка, куда кладём index.html и т.д.)

  Запуск из любой папки:
    powershell -ExecutionPolicy Bypass -File path\to\deploy_site2beget.ps1
#>

param(
  # Опционально можно переопределить base-href и deploy-url
  [string]$BaseHref = "/",
  [string]$DeployUrl = "/"
)

# --- Определяем папку скрипта (работает из любого места запуска) ---
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }

# --- Пути относительно скрипта ---
$EnvFile     = Join-Path $ScriptDir "beget.env"
$FrontendDir = Join-Path $ScriptDir "..\ocean-frontend"
$BuildDir    = Join-Path $FrontendDir "dist\ocean-frontend\browser"

# --- Загружаем переменные из beget.env (лежит рядом со скриптом) ---
if (-not (Test-Path $EnvFile)) {
  Write-Error "Не найден $EnvFile. Создай файл рядом со скриптом с переменными DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH."
  exit 1
}

Get-Content $EnvFile | ForEach-Object {
  if ($_ -match "^\s*#") { return }
  if ($_ -match "^\s*$") { return }
  $eq = $_.IndexOf("=")
  if ($eq -gt 0) {
    $k = $_.Substring(0, $eq).Trim()
    $v = $_.Substring($eq+1).Trim()
    # Сохраняем в текущую сессию PowerShell:
    [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
  }
}

$RemoteUser = $env:DEPLOY_USER
$RemoteHost = $env:DEPLOY_HOST
$RemotePath = $env:DEPLOY_PATH

if (-not $RemoteUser -or -not $RemoteHost -or -not $RemotePath) {
  Write-Error "В $EnvFile должны быть заданы DEPLOY_USER, DEPLOY_HOST и DEPLOY_PATH."
  exit 1
}

# --- Проверки наличия инструментов ---
function Test-Cmd($name) {
  $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Cmd "ssh")) { Write-Error "Не найден ssh в PATH."; exit 1 }
if (-not (Test-Cmd "scp")) { Write-Error "Не найден scp в PATH."; exit 1 }
if (-not (Test-Cmd "npm")) { Write-Error "Не найден npm в PATH."; exit 1 }

# --- Сборка фронтенда ---
if (-not (Test-Path $FrontendDir)) {
  Write-Error "Не найдена папка фронтенда: $FrontendDir"
  exit 1
}

Push-Location $FrontendDir
try {
  Write-Host "==> Installing NPM dependencies..."
  if (Test-Path "package-lock.json") {
    npm ci
  } else {
    npm install
  }
  if ($LASTEXITCODE -ne 0) { throw "Сбой установки зависимостей (npm ci/install)." }

  Write-Host "==> Building Angular project..."
  npm run build -- --configuration production --base-href $BaseHref --deploy-url $DeployUrl
  if ($LASTEXITCODE -ne 0) { throw "Сбой сборки Angular (npm run build)." }
} finally {
  Pop-Location
}

if (-not (Test-Path $BuildDir)) {
  Write-Error "Не найдена папка сборки: $BuildDir. Проверяй, успешно ли отработал ng build."
  exit 1
}

# --- Очистка удалённой папки ---
Write-Host "==> Cleaning remote directory $RemoteUser@${RemoteHost}:$RemotePath ..."
ssh "$RemoteUser@$RemoteHost" "rm -rf '$RemotePath'/*"

# --- Загрузка сборки ---
Write-Host "==> Uploading build to server..."
# В PowerShell допускается такая форма — локальная * раскроется шеллом:
scp -r "$BuildDir/*" "$RemoteUser@${RemoteHost}:$RemotePath/"

# альтернатива, если вдруг расширение * не сработает в вашей среде:
# $localPattern = Join-Path $BuildDir '*'
# scp -r $localPattern "$RemoteUser@$RemoteHost:`"$RemotePath/`""

Write-Host "==> Done! Site deployed to $RemoteUser@${RemoteHost}:$RemotePath"
