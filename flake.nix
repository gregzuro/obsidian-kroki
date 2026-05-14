{
  description = "Development environment for obsidian-kroki";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            git
          ];

          shellHook = ''
            echo "obsidian-kroki dev shell — node $(node --version), npm $(npm --version)"
          '';
        };
      });
}
