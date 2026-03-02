/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentSelectorCriteria } from './InstrumentSelector';
import { InstrumentDescriptor } from '../InstrumentDescriptor';

export function getIncompatibilityDetails(
  existing: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
) {
  let incompatibility = '';
  if (existing.unit !== otherDescriptor.unit) {
    incompatibility += `\t- Unit '${existing.unit}' does not match '${otherDescriptor.unit}'\n`;
  }
  if (existing.type !== otherDescriptor.type) {
    incompatibility += `\t- Type '${existing.type}' does not match '${otherDescriptor.type}'\n`;
  }
  if (existing.valueType !== otherDescriptor.valueType) {
    incompatibility += `\t- Value Type '${existing.valueType}' does not match '${otherDescriptor.valueType}'\n`;
  }
  if (existing.description !== otherDescriptor.description) {
    incompatibility += `\t- Description '${existing.description}' does not match '${otherDescriptor.description}'\n`;
  }

  return incompatibility;
}

export function getValueTypeConflictResolutionRecipe(
  existing: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
) {
  return `\t- use valueType '${existing.valueType}' on instrument creation or use an instrument name other than '${otherDescriptor.name}'`;
}

export function getUnitConflictResolutionRecipe(
  existing: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
) {
  return `\t- use unit '${existing.unit}' on instrument creation or use an instrument name other than '${otherDescriptor.name}'`;
}

export function getTypeConflictResolutionRecipe(
  existing: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
) {
  const selector: InstrumentSelectorCriteria = {
    name: otherDescriptor.name,
    type: otherDescriptor.type,
    unit: otherDescriptor.unit,
  };

  const selectorString = JSON.stringify(selector);

  return `\t- create a new view with a name other than '${existing.name}' and InstrumentSelector '${selectorString}'`;
}

export function getDescriptionResolutionRecipe(
  existing: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
): string {
  const selector: InstrumentSelectorCriteria = {
    name: otherDescriptor.name,
    type: otherDescriptor.type,
    unit: otherDescriptor.unit,
  };

  const selectorString = JSON.stringify(selector);

  return `\t- create a new view with a name other than '${existing.name}' and InstrumentSelector '${selectorString}'
    \t- OR - create a new view with the name ${existing.name} and description '${existing.description}' and InstrumentSelector ${selectorString}
    \t- OR - create a new view with the name ${otherDescriptor.name} and description '${existing.description}' and InstrumentSelector ${selectorString}`;
}

export function getConflictResolutionRecipe(
  existing: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
): string {
  // Conflicts that cannot be solved via views.
  if (existing.valueType !== otherDescriptor.valueType) {
    return getValueTypeConflictResolutionRecipe(existing, otherDescriptor);
  }

  if (existing.unit !== otherDescriptor.unit) {
    return getUnitConflictResolutionRecipe(existing, otherDescriptor);
  }

  // Conflicts that can be solved via views.
  if (existing.type !== otherDescriptor.type) {
    // this will automatically solve possible description conflicts.
    return getTypeConflictResolutionRecipe(existing, otherDescriptor);
  }

  if (existing.description !== otherDescriptor.description) {
    return getDescriptionResolutionRecipe(existing, otherDescriptor);
  }

  return '';
}
