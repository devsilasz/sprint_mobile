# Gera o APK de release localmente, sem EAS e sem login na Expo.
# Requisitos: Android Studio instalado (fornece o JDK e o Android SDK) e
# dependências instaladas (npm install).
# Uso (na pasta sprint-mobile-frontend):
#   npm run build:apk:local
#   powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1 -ApiUrl http://192.168.0.10:3000

param(
  # Endereço padrão da API embutido no APK. 10.0.2.2 é o "localhost" do
  # computador visto de dentro do emulador Android. Em celular físico, o
  # endereço pode ser alterado depois pelo próprio app (link "Servidor").
  [string]$ApiUrl = "http://10.0.2.2:3000",
  # Pasta curta usada na compilação (veja o comentário abaixo).
  [string]$BuildDir = "$env:SystemDrive\sm-apk-build"
)

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $PSScriptRoot

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA "Android\Sdk" }
$jdk = if ($env:JAVA_HOME) { $env:JAVA_HOME } else { "C:\Program Files\Android\Android Studio\jbr" }
if (-not (Test-Path $sdk)) { throw "Android SDK não encontrado em $sdk. Instale o Android Studio." }
if (-not (Test-Path "$jdk\bin\java.exe")) { throw "JDK não encontrado em $jdk. Defina JAVA_HOME." }
if (-not (Test-Path "$projectDir\node_modules")) { throw "Rode 'npm install' antes de gerar o APK." }

$env:ANDROID_HOME = $sdk
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$env:Path"
$env:EXPO_PUBLIC_API_URL = $ApiUrl
$env:NODE_ENV = "production"
$env:CI = "1"

# A compilação nativa do React Native estoura o limite de 260 caracteres de
# caminho do Windows quando o projeto está em uma pasta profunda. Por isso o
# projeto é espelhado em uma pasta curta antes do build (robocopy /MIR copia
# apenas o que mudou nas execuções seguintes).
Write-Host "Copiando projeto para $BuildDir..."
# Exclusões com caminho completo: um nome solto (ex.: "dist") excluiria
# também as pastas de mesmo nome dentro de node_modules.
$exclude = @("android", ".expo", "dist") | ForEach-Object { Join-Path $projectDir $_ }
robocopy $projectDir $BuildDir /MIR /MT:16 /NFL /NDL /NJH /NJS /NP /XD $exclude | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Falha ao copiar o projeto (robocopy $LASTEXITCODE)." }

Set-Location $BuildDir
try {
  Write-Host "Gerando projeto nativo (expo prebuild)..."
  npx expo prebuild -p android --no-install
  if ($LASTEXITCODE -ne 0) { throw "Falha no expo prebuild." }

  "sdk.dir=$($sdk -replace '\\', '/')" | Out-File -Encoding ascii android\local.properties
  # Apenas as arquiteturas usadas por celulares atuais (arm64) e emuladores (x86_64).
  (Get-Content android\gradle.properties) -replace '^reactNativeArchitectures=.*', 'reactNativeArchitectures=arm64-v8a,x86_64' |
    Set-Content -Encoding ascii android\gradle.properties
  (Get-Content android\gradle\wrapper\gradle-wrapper.properties) -replace '^networkTimeout=.*', 'networkTimeout=120000' |
    Set-Content -Encoding ascii android\gradle\wrapper\gradle-wrapper.properties

  Write-Host "Compilando APK (pode levar de 10 a 20 minutos na primeira vez)..."
  Set-Location "$BuildDir\android"
  & .\gradlew.bat assembleRelease --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "Falha no build Gradle." }

  $releases = Join-Path (Split-Path -Parent $projectDir) "releases"
  New-Item -ItemType Directory -Force $releases | Out-Null
  $apk = Join-Path $releases "inteligencia-competitiva.apk"
  Copy-Item "$BuildDir\android\app\build\outputs\apk\release\app-release.apk" $apk -Force
  Write-Host "APK gerado: $apk"
}
finally {
  Set-Location $projectDir
}
