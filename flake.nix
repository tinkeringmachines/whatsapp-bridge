{
  description = "WhatsApp Web bridge with credential management";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      perSystem = { config, self', inputs', pkgs, system, ... }: {
        packages = {
          default = pkgs.buildNpmPackage {
            pname = "whatsapp-bridge";
            version = "1.0.0";
            src = ./.;

            npmDepsHash = "sha256-7cto/nT28rWLB8UatRGAjZjIfrW7K8afICcy1Q10ceo=";

            nativeBuildInputs = with pkgs; [
              python3
              pkg-config
            ];

            buildInputs = with pkgs; [
              # For better-sqlite3
              sqlite
            ];

            dontNpmBuild = true;

            installPhase = ''
              runHook preInstall
              mkdir -p $out/lib/whatsapp-bridge $out/bin
              cp -r node_modules $out/lib/whatsapp-bridge/
              cp -r src $out/lib/whatsapp-bridge/
              cp package.json $out/lib/whatsapp-bridge/

              cat > $out/bin/whatsapp-bridge << EOF
              #!/bin/sh
              exec ${pkgs.nodejs}/bin/node $out/lib/whatsapp-bridge/src/index.js "\$@"
              EOF
              chmod +x $out/bin/whatsapp-bridge
              runHook postInstall
            '';

            meta = with pkgs.lib; {
              description = "WhatsApp Web bridge with credential management";
              license = licenses.mit;
              mainProgram = "whatsapp-bridge";
            };
          };
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            python3
            pkg-config
            sqlite
          ];
        };
      };
    };
}
