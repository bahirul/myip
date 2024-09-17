# myip

Simple api built with [bwx](https://github.com/bahirul/bwx) that returns the client's IP address.

## Usage

```bash
$ curl http://localhost:3000
```

```json
{
  "status": "success",
  "data": {
    "ip": "8.8.8.8",
    "type": "ipv4",
    "as": "15169",
    "cc": "US",
    "registry": "ARIN",
    "org": "Google LLC",
    "timeTaken": "0.68ms"
  }
}
```

## Thrid Party Services

- [bgp.tools](https://bgp.tools) for IP information

## License

[ISC](LICENSE)
