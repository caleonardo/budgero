#!/usr/bin/env bash
# Run on the Dell host. Rules apply only to the dedicated runner bridge.
set -euo pipefail
bridge=budgerobr0
nft list table inet budgero_ci >/dev/null 2>&1 || nft add table inet budgero_ci
nft -f - <<'RULES'
flush table inet budgero_ci
table inet budgero_ci {
  chain input {
    type filter hook input priority -10; policy accept;
    iifname "budgerobr0" udp dport { 53, 67 } accept
    iifname "budgerobr0" tcp dport 53 accept
    iifname "budgerobr0" reject
  }
  chain forward {
    type filter hook forward priority -10; policy accept;
    iifname "budgerobr0" ip daddr { 0.0.0.0/8, 10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.168.0.0/16, 224.0.0.0/4, 240.0.0.0/4 } reject
    iifname "budgerobr0" meta nfproto ipv6 reject
  }
}
RULES
# Docker's forwarding policy also applies to LXD. These rules only permit
# this bridge; the nftables isolation rules above still reject private networks.
iptables -C DOCKER-USER -i "$bridge" -j ACCEPT 2>/dev/null || iptables -I DOCKER-USER -i "$bridge" -j ACCEPT
iptables -C DOCKER-USER -o "$bridge" -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || iptables -I DOCKER-USER -o "$bridge" -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
