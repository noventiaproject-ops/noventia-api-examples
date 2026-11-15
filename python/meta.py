"""Your key, its limits and what it used today. Costs nothing.  Run: python meta.py"""

import json

from noventia import NoventiaError, meta

try:
    m = meta()
except NoventiaError as err:
    wait = "" if err.retry_after is None else " Wait %d seconds." % err.retry_after
    raise SystemExit("%d %s: %s%s" % (err.status, err.code, err, wait))

key = m["key"]
print('Key "%s", plan %s.' % (key["name"], key["plan"]))
print("Limits:", key["limits"])
print("Used today:", key["today"])
print("Rules in force:", json.dumps(m["meta"]["rules"]))
print("%d warning codes, %d fact kinds." % (len(m["warningCodes"]), len(m["factKinds"])))
