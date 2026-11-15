"""A small client of the Noventia public check API. Standard library only, Python 3.9 or newer."""

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = os.environ.get("NOVENTIA_API_BASE", "https://core.noventia.app/v1/public")


class NoventiaError(Exception):
    """A refusal of the API: {"error": {"code", "message", "messageCode", "params"}}."""

    def __init__(self, status, code, message, retry_after):
        super().__init__(message)
        self.status = status
        self.code = code
        # Seconds to wait, from the Retry-After header of a 429 or a 503.
        self.retry_after = retry_after


def _key():
    key = os.environ.get("NOVENTIA_API_KEY", "")
    if not key:
        raise SystemExit("Set NOVENTIA_API_KEY to your key.")
    return key


def _call(path, body=None, repeated=False):
    headers = {"Authorization": "Bearer " + _key(), "Accept": "application/json", "User-Agent": "noventia-api-examples"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(BASE + path, data=data, headers=headers, method="GET" if body is None else "POST")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        try:
            retry_after = int(err.headers.get("Retry-After", ""))
        except ValueError:
            retry_after = None
        # The rate limit of a minute: wait once and repeat. A spent day (503) is not waited out here.
        if err.code == 429 and not repeated and retry_after is not None and 0 < retry_after <= 60:
            time.sleep(retry_after)
            return _call(path, body, True)
        try:
            error = json.load(err).get("error", {})
        except ValueError:
            error = {}
        raise NoventiaError(err.code, error.get("code", "unknown"), error.get("message", "HTTP %d" % err.code), retry_after) from None


def check_token(mint, depth="mint"):
    """A token. "mint" reads the mint account, metadata and top holders; "full" adds the creator's history."""
    return _call("/token/%s?depth=%s" % (urllib.parse.quote(mint, safe=""), depth))


def check_wallet(address):
    """An address: what kind of account it is, its age, the tokens it launched."""
    return _call("/wallet/" + urllib.parse.quote(address, safe=""))


def check_transaction(transaction, signer):
    """A transaction in base64, signed or unsigned. It is simulated and dropped; the API does not send it."""
    return _call("/transaction", {"transaction": transaction, "signer": signer})


def meta():
    """The rule versions, every warning code, the limits of the key and what it used today. Costs nothing."""
    return _call("/meta")


def print_warnings(answer):
    """Prints the warnings of an answer and what was not read. Facts, and no verdict."""
    m = answer["meta"]
    print("As of %s (%s, %s credits)." % (m["asOf"], m["cache"], m["credits"]))
    if not answer["warnings"]:
        print("No warning was made from what was read.")
    for w in answer["warnings"]:
        print("Level %s  %s: %s" % (w["warningLevel"], w["code"], w["text"]))
    for n in answer["notRead"]:
        print("Not read: %s (%s)" % (n["what"], n["reason"]))
