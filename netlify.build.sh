#!/usr/bin/env bash
set -e

# Install latest .NET 7.0 release
pushd /tmp
wget https://dotnet.microsoft.com/download/dotnet/scripts/v1/dotnet-install.sh
chmod u+x /tmp/dotnet-install.sh
/tmp/dotnet-install.sh --channel 7.0
popd

# Build
dotnet run