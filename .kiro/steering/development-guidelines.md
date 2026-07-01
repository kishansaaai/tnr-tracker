# Development Guidelines

## Core Principles
- **Stability First**: This is a working application - don't break what works
- **Read Before Write**: Always understand existing code before modifying
- **Incremental Changes**: Make small, testable changes rather than large refactors
- **Documentation**: Keep docs/ folder updated with any architectural changes

## File Organization
- Keep component files in their current locations
- Maintain consistent naming conventions with existing files
- Don't reorganize the folder structure without explicit permission

## Code Safety
- Never modify `.env` files - they contain sensitive credentials
- Test database changes carefully (see docs/DATABASE.md)
- Review API changes against docs/API.md

## Before Making Changes
1. Check if similar functionality already exists
2. Review relevant documentation in `docs/`
3. Understand the data flow and dependencies
4. Consider impact on existing features

## Development Commands
- Use the commands defined in package.json
- Don't add new build tools without discussion
- Preserve existing scripts and workflows
