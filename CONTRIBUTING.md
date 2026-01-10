# Contributing to typemold

Thank you for your interest in contributing to typemold! 🎉

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/sevirial/typemold/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - TypeScript/Node.js version

### Suggesting Features

1. Open a [Feature Request](https://github.com/sevirial/typemold/issues/new?template=feature_request.md)
2. Describe the use case and proposed solution
3. Wait for discussion before implementing

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following our [Code Style](#code-style)
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit with [Conventional Commits](#commit-messages)
7. Push and create a Pull Request

## Branch Naming

| Branch Type   | Pattern                | Example                     |
| ------------- | ---------------------- | --------------------------- |
| Feature       | `feature/description`  | `feature/add-batch-mapping` |
| Bug Fix       | `fix/description`      | `fix/nested-path-error`     |
| Documentation | `docs/description`     | `docs/improve-readme`       |
| Refactor      | `refactor/description` | `refactor/optimize-cache`   |

## Commit Messages

We follow [Conventional Commits](https://conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

- `feat(mapper): add batch mapping support`
- `fix(decorators): resolve nested path issue`
- `docs: update README examples`

## Code Style

- Use TypeScript strict mode
- Avoid `any` - use `unknown` with type guards
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for new features

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/typemold.git
cd typemold

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Questions?

Open a [Discussion](https://github.com/sevirial/typemold/discussions) or reach out!
