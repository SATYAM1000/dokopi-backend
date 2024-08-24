# Git Commit Message Conventions For This Repository

This document provides guidelines on using specific prefixes for Git commit messages to ensure clarity and consistency in commit history.

## Commit Message Prefixes

Using prefixes in commit messages helps categorize and quickly identify the purpose of each change. Below is a list of common prefixes and their usage:

### `feat` - Feature

**Description**: Use this prefix when introducing a new feature or functionality to the project.

**Example**:
feat: add user authentication feature


**Usage**:
- New features or enhancements
- Significant additions that improve the project

---

### `fix` - Bug Fix

**Description**: Use this prefix when fixing a bug or issue in the codebase.

**Example**:
fix: correct calculation error in payment module


**Usage**:
- Resolving issues or defects
- Any changes that address bugs or unexpected behaviors

---

### `docs` - Documentation

**Description**: Use this prefix for changes related to documentation, such as updates to README files, comments, or other documentation.

**Example**:
docs: update API usage instructions in README


**Usage**:
- Adding or updating documentation
- Fixing typos or errors in documentation

---

### `style` - Code Style

**Description**: Use this prefix for changes that affect code formatting, style, or appearance but do not alter functionality.

**Example**:
style: fix indentation issues in user service


**Usage**:
- Code formatting adjustments
- Consistency improvements in code style

---

### `refactor` - Code Refactoring

**Description**: Use this prefix when restructuring existing code without changing its external behavior or functionality.

**Example**:
refactor: optimize user data processing logic


**Usage**:
- Improving code structure or readability
- Simplifying code without altering behavior

---

### `perf` - Performance

**Description**: Use this prefix for changes that improve the performance of the application, such as optimizations or speed improvements.

**Example**:
perf: enhance database query performance


**Usage**:
- Performance optimizations
- Changes aimed at reducing latency or improving efficiency

---

### `test` - Tests

**Description**: Use this prefix for changes related to testing, including adding, updating, or fixing tests.

**Example**:
test: add unit tests for user authentication


**Usage**:
- Adding new tests
- Updating or fixing existing tests
- Improving test coverage

---

### `build` - Build System

**Description**: Use this prefix for changes related to the build system or configuration, such as build tools or dependencies.

**Example**:
build: update webpack configuration for production


**Usage**:
- Modifications to build scripts or configurations
- Updates to dependencies affecting the build process

---

### `ci` - Continuous Integration

**Description**: Use this prefix for changes related to CI/CD configurations and scripts.

**Example**:
ci: add linting step to CI pipeline


**Usage**:
- Updates to CI/CD pipelines or configurations
- Modifications to continuous integration setups

---

### `chore` - Chores

**Description**: Use this prefix for routine maintenance tasks that do not fit into other categories, including minor improvements and administrative changes.

**Example**:
chore: update dependency versions


**Usage**:
- Routine maintenance tasks
- Administrative changes not impacting functionality

---

### `revert` - Revert

**Description**: Use this prefix when reverting a previous commit. This is used to undo changes and restore a previous state.

**Example**:
revert: undo changes from commit abc1234


**Usage**:
- Reverting changes introduced by a previous commit
- Undoing commits that introduced errors or issues

---
