# Changelog

All notable changes to the "Tripla QA - Guest Page Filler" extension will be documented in this file.

## [1.0.3] - 2024-06-05

### Added
- Jira/Confluence TestCase Dropdown
- Create labels dropdown automatically when users are updating TestCase page in confluence and jira ticket pages.

## [1.0.2] - 2024-05-17

### Added
- Add a default popup to improve efficiency so we can do same operation with fewer clicks.

### Removed
- Remove context menus

### Fixed
- Fix domain switch problem without iframe

## [1.0.1] - 2024-05-07

### Added
- Added error logging for missing required form elements.
- Introduced handling for optional form fields, allowing the extension to handle cases where 'postal-code' and 'street-address' fields are not found.

### Fixed
- Improved form filling logic to skip optional fields if not present, reducing errors during automatic form population.

## [1.0.0] - 2024-04-15

- Initial release of the Tripla QA extension.
- Features included:
  1. Guest Info Filler: Automatically populate forms with guest information with a single click.
  2. Domain Switcher: Allows switching between different domains without manual URL adjustments.
