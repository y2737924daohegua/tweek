import React from 'react';
import R from 'ramda';
import PartitionsSelector from './Partition/PartitionsSelector';
import RulesList from './RulesList/RulesList';
import DefaultValue from './Rule/DefaultValue';
import PartitionsList from './PartitionsList/PartitionsList';
import * as RulesService from '../../../../../../../services/rules-service';
import * as TypesService from '../../../../../../../services/types-service';
import style from './JPadEditor.css';

const isBrowser = typeof (window) === 'object';

function createPartitionedRules(depth) {
  if (depth == 0) return [];
  return {"*": createPartitionedRules(depth - 1)};
}

function isEmptyRules(rules) {
  if (!rules) return true;
  if (Array.isArray(rules)) return rules.length == 0;
  if (Object.keys(rules).some(k => k != '*')) return false;
  return isEmptyRules(rules['*']);
}

export default ({valueType, mutate, showConfirm}) => {
  if (!isBrowser)
    return (<div>Loading rule...</div>);

  const partitions = mutate.in("partitions").getValue();
  const defaultValueMutate = mutate.in("defaultValue");

  const handlePartitionAddition = (newPartition) => {
    // const rules = mutate.in("rules").getValue();
    // if (!isEmptyRules(rules) && !confirm("This operation will partition all the rules.\nDo you want to continue?")) return;
    // mutate.apply(m => m.insert("rules", RulesService.addPartition(newPartition, rules, partitions.length)).in("partitions").append(newPartition).up());
    const newPartitions = partitions.concat(newPartition);
    onPartitionsChanged(newPartitions);
  };
  const handlePartitionDelete = (index) => {
    const newPartitions = R.remove(index, 1, partitions);
    onPartitionsChanged(newPartitions);
  };
  const onPartitionsChanged = (newPartitions) => {
    showConfirm({
      shouldShow: !isEmptyRules(mutate.in("rules").getValue()),
      title: 'Warning',
      message: 'If you change the partitions the rules will be reset.\nDo you want to continue?',
      onResult: (result) => {
        if (!result) return;
        mutate.apply(m => m.insert("partitions", newPartitions).insert("rules", createPartitionedRules(newPartitions.length)));
      }
    });
  };
  const updateDefaultValue = (newValue) => {
    const typedValue = newValue && TypesService.safeConvertValue(newValue, valueType);
    if (typedValue === undefined || typedValue === '') {
      defaultValueMutate.delete();
    } else {
      defaultValueMutate.updateValue(typedValue);
    }
  };

  return (
    <div className={style['jpad-editor-container']}>
      <div className={style['jpad-settings']}>
        <DefaultValue
          value={defaultValueMutate.getValue()}
          valueType={valueType}
          onChange={updateDefaultValue}
        />
        <div className={style['vertical-separator']}></div>
        <PartitionsSelector
          partitions={partitions}
          handlePartitionAddition={handlePartitionAddition}
          handlePartitionDelete={handlePartitionDelete}
        />
      </div>

      {
        partitions && partitions.length > 0
          ? <PartitionsList {...{partitions, valueType, showConfirm}} mutate={mutate.in("rules")}/>
          : <RulesList {...{valueType, showConfirm}} mutate={mutate.in("rules")}/>
      }
    </div>
  );
}