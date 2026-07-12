# Coding Standards

- Use TypeScript for application code.
- Prefer explicit types at architectural boundaries.
- Keep functions and services focused on one clear responsibility.
- Keep UI, workflows, repositories, storage, wallet, and Algorand concerns separated.
- Treat persisted schemas and blockchain payloads as versioned contracts.
- Do not log passwords, document contents, or sensitive signed payloads.
- Avoid broad `any` casts; document unavoidable SDK compatibility casts.
- Add tests for deterministic services and trust decisions.
- Use user-facing messages that distinguish cancellation, validation failure, network failure, timeout, and confirmation.
- Do not add speculative code.