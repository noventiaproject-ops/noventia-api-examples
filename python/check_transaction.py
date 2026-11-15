"""A transaction before it is signed.  Run: python check_transaction.py <base64 transaction> <signer address>

The transaction is simulated and dropped. The API does not send it to the chain.
"""

import sys

from noventia import check_transaction, print_warnings

if len(sys.argv) < 3:
    raise SystemExit("Usage: python check_transaction.py <base64 transaction> <signer address>")

answer = check_transaction(sys.argv[1], sys.argv[2])
simulation = answer["simulation"]
changes = answer["changes"]

print("The simulation ran." if simulation["status"] == "ok" else "The simulation failed: %s" % simulation.get("error"))
if changes.get("sol"):
    print("SOL: %d lamports" % (int(changes["sol"]["after"]) - int(changes["sol"]["before"])))
for t in changes.get("tokens", []):
    print("Token %s: %d raw units" % (t["mint"], int(t["after"]) - int(t["before"])))
for g in answer.get("grants", []):
    print("Grant, %s: account %s%s" % (g["kind"], g["account"], "" if g.get("to") is None else " to " + g["to"]))
for p in answer.get("programs", []):
    print("Program %s" % (p.get("name") or p["address"] if p["listed"] else p["address"] + " (outside the recognized lists)"))
print_warnings(answer)
print("A simulation shows what would happen at this moment. The chain can differ a second later.")
