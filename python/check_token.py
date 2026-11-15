"""A token before a signature.  Run: python check_token.py <mint> [mint|full]"""

import sys

from noventia import check_token, print_warnings

mint = sys.argv[1] if len(sys.argv) > 1 else "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
depth = sys.argv[2] if len(sys.argv) > 2 else "mint"

answer = check_token(mint, depth)
print("Token %s, depth %s." % (mint, depth))
print_warnings(answer)

# A wallet or a DEX can filter by the highest level and still show every warning with its proofs.
if (answer.get("highestWarning") or 0) >= 2:
    print("Show these warnings to the user before they sign.")
