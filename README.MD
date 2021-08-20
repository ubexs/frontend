# Ubx Web Frontend
Built on top of BlocksHub by https://beak.dev/ (It's not related)

### Dev Env Setup
1. Create a file called config.json
2. Pase this into it:
```json
{
    "baseUrl": {
        "backend": "http://api-devsite.ubx.10allday.com",
        "frontend": "http://api-devsite.ubx.10allday.com",
        "play": "http://play-devsite.ubx.10allday.com"
    },
    "backendAuthorization": "example-key",
    "env": "DEVELOPMENT",
    "port": 3005,
    "recaptcha": {
        "v3": {
            "public": "6Lc9VM8UAAAAAFlnULqvxYegRA9iz-DZg-SAuQRE"
        },
        "v2": {
            "public": "6LcNVc8UAAAAALqEX0uRZGnCCR7UHl53jDlYQwHY"
        }
    }
}
```
3. Run `npm install`
4. Run `npm run start:dev`
