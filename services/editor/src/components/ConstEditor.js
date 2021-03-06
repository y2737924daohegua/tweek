import React from 'react';
import TypedInput from './common/Input/TypedInput';

const ConstEditor = ({ value, valueType, onChange, onValidationChange }) => (
  <div data-comp="const-editor" style={{ display: 'flex', width: '100%' }}>
    <TypedInput {...{ value, valueType, onChange }} />
  </div>
);

export default ConstEditor;
