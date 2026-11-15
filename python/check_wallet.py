"""An address.  Run: python check_wallet.py <address>"""

import sys

from noventia import check_wallet, print_warnings

if len(sys.argv) < 2:
    raise SystemExit("Usage: python check_wallet.py <address>")

answer = check_wallet(sys.argv[1])
account = answer["account"]
if account["kind"] == "recognized":
    recognized = account.get("recognized") or {}
    print("A recognized service: %s (%s)." % (recognized.get("name", ""), recognized.get("list", "")))
elif account["kind"] == "wallet":
    print("A wallet. First transaction %s days ago." % answer.get("ageDays"))
else:
    print("No wallet: a program, a token account or another account.")
print_warnings(answer)
