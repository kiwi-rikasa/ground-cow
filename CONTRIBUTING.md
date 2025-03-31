# Ground Cow's Contributing guidelines

## Getting Started

### Backend Setup

For detailed backend setup instructions, please refer to the [Backend README](./backend/README.md).

### Frontend Setup

For detailed frontend setup instructions, please refer to the [Frontend README](./frontend/README.md).

## Development Workflow

1. Fork the repository
2. Clone your fork: `git clone https://github.com/kiwi-rikasa/ground-cow`
3. Create a new branch: `git checkout -b your-branch-name`
4. Make your changes
5. Run tests and linting:
   - Backend: `ruff check .` and `ruff format .`
   - Frontend: `bun run lint` and `bun run test`
6. Commit your changes following the commit message conventions
7. Push to your fork: `git push origin your-branch-name`
8. Create a pull request

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if necessary
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request
5. Get approval from at least one maintainer
6. Your PR will be merged by a maintainer

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Example: `feat(frontend): add user profile page`

## Coding Standards

### Backend (Python)
- Follow PEP 8 guidelines
- Use type hints
- Write docstrings for all functions and classes
- Use Ruff for linting and formatting

### Frontend (TypeScript/Next.js)
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Use TypeScript for type safety
- Include meaningful comments

## Testing

WIP

Happy contributing! 