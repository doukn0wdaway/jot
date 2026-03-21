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

        runtimeDeps = with pkgs; [
          gtk3
          webkitgtk_4_1
          glib-networking
          gsettings-desktop-schemas
          librsvg
          libGL
          pango
          cairo
          gdk-pixbuf
        ];

        frontend = pkgs.buildNpmPackage {
          pname = "jot-frontend";
          version = "0.1.0";
          src = ./frontend;

          # npmDepsHash = pkgs.lib.fakeHash;
          npmDepsHash = "sha256-LiuDgkkIha1QC5IDTaRt+e+wUSoUHkq1M/ONL8mMCrc=";

          makeCacheWritable = true;

          installPhase = ''
            cp -r dist $out
          '';
        };
      in
      {
        packages.default = pkgs.buildGoModule rec {
          pname = "jot";
          version = "0.1.0";
          src = ./.;

          # vendorHash  = pkgs.lib.fakeHash;
          vendorHash = "sha256-TSqZGL8qY/RRmW9b/EJ8irA29rr61awNDSRnSM68Cq0=";

          nativeBuildInputs = with pkgs; [
            pkg-config
            gcc
            makeWrapper
          ];
          buildInputs = runtimeDeps;

          ldflags = [
            "-s"
            "-w"
          ];
          tags = [ "production" ];
          trimpath = true;

          subPackages = [ "." ];

          preBuild = ''
            mkdir -p frontend/dist
            cp -r ${frontend}/* frontend/dist/
          '';

          installPhase = ''
            mkdir -p $out/bin
            cp $GOPATH/bin/${pname} $out/bin/ || cp ${pname} $out/bin/
            wrapProgram $out/bin/${pname} \
              --set GDK_BACKEND wayland \
              --set GIO_EXTRA_MODULES "${pkgs.glib-networking}/lib/gio/modules" \
              --set XDG_DATA_DIRS "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}" \
              --prefix LD_LIBRARY_PATH : "${pkgs.lib.makeLibraryPath [ pkgs.gtk3 pkgs.webkitgtk_4_1 pkgs.libGL ]}"
          '';

        };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [ go pkg-config gcc nodejs_24 ];
          buildInputs = runtimeDeps;
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

            echo "✅ Wails v3 environment loaded"
          '';
        };
      });
}
