# Contributing

Thank you for your interest in Algorand Document Vault.

This is a security-first project. Changes should be small, purposeful, reviewable, and supported by verification.

## Before contributing

- Read the README and architecture documentation.
- Search existing issues before opening a new one.
- Use a private security report instead of a public issue for vulnerabilities.
- Keep proposals within the project's privacy-first and evidence-focused scope.

## Development setup

```powershell
git clone https://github.com/tkent2002-glitch/algorand-document-vault.git
cd algorand-document-vault
npm ci
npm run dev
```

## Required verification

Before opening a pull request:

```powershell
npm test
npm run build
```

Do not submit changes that introduce test failures, TypeScript errors, build warnings caused by the change, or unrelated formatting churn.

## Change guidelines

- Use TypeScript for application code.
- Preserve the dependency direction between UI, workflows, repositories, services, and storage.
- Do not access IndexedDB or localStorage directly from pages or UI components.
- Do not introduce speculative abstractions or unused features.
- Avoid logging document content, passwords, signed transactions, or other sensitive values.
- Add or update tests for meaningful behavior changes.
- Update documentation when architecture or user-visible behavior changes.

## Pull requests

A pull request should explain:

- What problem it solves
- Why the change belongs in the project
- Which trust boundaries or persisted formats are affected
- How it was tested
- Any remaining limitations or risks

## Commit messages

Use concise, descriptive messages, for example:

```text
security Harden encrypted backup validation
storage Add IndexedDB migration recovery test
docs Explain blockchain proof boundaries
```

By participating, you agree to follow the project's [Code of Conduct](CODE_OF_CONDUCT.md).