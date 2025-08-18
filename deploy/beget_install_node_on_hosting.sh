#!/usr/bin/env bash

# Не проверял

set -euo pipefail

# ===== Настройки =====
# Версия по умолчанию, если не передана аргументом
DEFAULT_VER="20.11.0"
VER="${1:-$DEFAULT_VER}"

# Карта "версия -> совместимый архив Beget"
declare -A LINKS=(
  ["18.17.0"]="https://cp.beget.com/shared/nZ-Grt-wdN-TpDRnWM0Fg3XkTf_NScI2/node-v18.17.0-bionic.tar.xz"
  ["18.18.2"]="https://cp.beget.com/shared/emJm-JWhtkILld_1KrNyU34ym75SfM--/node-v18.18.2-bionic.tar.xz"
  ["18.19.0"]="http://cp.beget.com/shared/ikj6tguPH4FTb40HxqX2ZZ-XNWbvCohj/node-v18.19.0-bionic.tar.xz"
  ["19.9.0"]="https://cp.beget.com/shared/wHV_h4FJaIvwzqchZJuyRPalU58o5xmP/node-v19.9.0-bionic.tar.xz"
  ["20.5.0"]="https://cp.beget.com/shared/H1crojipLBTHZbxHTvYA-ro_JXppCrB-/node-v20.5.0-bionic.tar.xz"
  ["20.9.0"]="https://cp.beget.com/shared/kdEvvyndUCBRspzTKAhKD_X97gxk-6Oi/node-v20.9.0-bionic.tar.xz"
  ["20.11.0"]="https://cp.beget.com/shared/ON0kacA35gnJJ5FbZa3WvdY6-wtaR4Kl/node-v20.11.0-bionic.tar.xz"
  ["20.18.0"]="https://cp.beget.com/shared/mTuC2AhpJ7TjGCEEwczf0y2fzWXGqxZv/node-v20.18.0-bionic.tar.xz"
  ["21.2.0"]="https://cp.beget.com/shared/nD5s5AJxHlEVoLuZU5eshEpHjg2I8obo/node-v21.2.0-bionic.tar.xz"
  ["21.5.0"]="http://cp.beget.com/shared/xmndW61z9PdrEzEzuf49T2X50I86ek3S/node-v21.5.0-bionic.tar.xz"
)

# ===== Проверки окружения =====
need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Требуется $1"; exit 1; }; }
need wget
need tar

URL="${LINKS[$VER]:-}"
if [[ -z "$URL" ]]; then
  echo "❌ Неизвестная версия: $VER"
  echo "Доступные: ${!LINKS[@]}" | sed 's/ /\n  • /g' | sed '1s/^/  • /'
  exit 1
fi

echo "➡️  Устанавливаю Node.js $VER из:"
echo "    $URL"

# ===== Подготовка каталогов =====
cd ~
mkdir -p .local
cd .local

ARCHIVE="node-v${VER}-bionic.tar.xz"

# Бэкапим текущую .local/bin/node при наличии
if [[ -x "bin/node" ]]; then
  mkdir -p "../.local_backup_${VER}_$(date +%Y%m%d%H%M%S)"
  cp -a bin "../.local_backup_${VER}_$(date +%Y%m%d%H%M%S)/" || true
fi

# ===== Загрузка и распаковка (в .local с --strip 1) =====
echo "⬇️  Скачиваю архив..."
wget -O "$ARCHIVE" "$URL"

echo "📦 Распаковываю в ~/.local (strip 1)..."
tar -xJf "$ARCHIVE" --strip 1

# Чистим архив
rm -f "$ARCHIVE"

# ===== Права доступа (важно для веб-окружения Beget) =====
# Открываем каталог ~/.local и ~/.local/bin для чтения/исполнения «веб-пользователю»
# chmod 755 ~/~.local || true  # защитим от ошибки; корректная команда ниже
# chmod 755 -R "$HOME/.local" || true
# Точечно гарантируем доступ к нужным объектам:
# chmod 755 "$HOME/.local" "$HOME/.local/bin" || true
# chmod 755 "$HOME/.local/bin/node" "$HOME/.local/bin/npm" "$HOME/.local/bin/npx" || true

# ===== PATH (на многих тарифах ~/bin уже в PATH; иначе добавим ~/.local/bin) =====
if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
  export PATH="$HOME/.local/bin:$PATH"
fi

# ===== Проверка =====
echo "🧪 Проверка версий:"
node -v && npm -v

echo
echo "✅ Готово. Если используешь Passenger, пропиши путь в .htaccess:"
echo "  PassengerNodejs /home/p/$(whoami)/.local/bin/node"
echo
echo "И перезапусти приложение:"
echo "  cd ~/api.ponomarev-aa.ru/app && touch tmp/restart.txt"
echo
echo "ℹ️ Примечания:"
echo "  • Скрипт распаковывает Node прямо в ~/.local (как рекомендует Beget)."
echo "  • Права доступа выставлены так, чтобы веб-окружение видело бинарники."
echo "  • Для смены версии запусти:  ./install_node_beget.sh <версия> (напр. 20.18.0)"
