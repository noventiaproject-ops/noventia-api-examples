# Python

Needs Python 3.9 or newer. No packages to install.

```sh
export NOVENTIA_API_KEY="your key"

python meta.py
python check_token.py EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
python check_token.py EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v full
python check_wallet.py <address>
python check_transaction.py <base64 transaction> <signer address>
```

[noventia.py](noventia.py) is the whole client: one function per call, one error class, one wait and repeat on a 429. Copy it into your project and change it as you need.
