# APP-282 Contracts

- Core `POST /tasks`: 65,000 ms.
- Supervisor-protected Harbor session lifecycle POST: 20,000 ms.
- Other owner API requests: 5,000 ms.
- Authorization, response validation, fail-closed behavior, and owner refs remain unchanged.
