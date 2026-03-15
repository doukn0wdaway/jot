{
  description = "Jot flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            go
            pkg-config
            gcc
            nodejs_24
          ];

          buildInputs = with pkgs; [
            gtk3
            webkitgtk_4_1

            # Важно для стилей и работы сети в WebView
            glib-networking
            gsettings-desktop-schemas
            librsvg

            # Графика
            mesa
            libGL
          ];

          shellHook = ''
            export GOPATH=$HOME/go
            export PATH=$PATH:$GOPATH/bin
            
            # 1. Пути для компиляции
            export PKG_CONFIG_PATH="${pkgs.gtk3.dev}/lib/pkgconfig:${pkgs.webkitgtk_4_1.dev}/lib/pkgconfig:$PKG_CONFIG_PATH"
            
            # 2. Пути для рантайма (чтобы WebView видел библиотеки)
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.gtk3 pkgs.webkitgtk_4_1 pkgs.libGL ]}:$LD_LIBRARY_PATH"

            # 3. TLS и Схемы (исправляет "кривые" шрифты и ошибки сети)
            export GIO_EXTRA_MODULES="${pkgs.glib-networking}/lib/gio/modules"
            export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS"
            
            # 4. Исправление рендеринга в Hyprland
            export GDK_BACKEND=wayland
            # Если стили все равно "битые" или экран черный, раскомментируй это:
            # export WEBKIT_DISABLE_COMPOSITING_MODE=1 

            echo "✅ Wails v3 environment loaded"
          '';
        };
      });
}
